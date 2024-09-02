import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import fileDownload from 'js-file-download'
import JSZip from 'jszip'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'
import { Text } from '@databyss-org/ui/primitives'
import { getDocument, getDocuments } from '@databyss-org/data/pouchdb/utils'
import { DbDocument, DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import { useBlocksInPages, usePages } from '@databyss-org/data/pouchdb/hooks'
import { makeBackupFilename } from '@databyss-org/data/pouchdb/backup'
import { dbRef } from '@databyss-org/data/pouchdb/db'
import { useUserPreferencesContext } from '@databyss-org/ui/hooks'
import { appCommands } from '@databyss-org/ui/lib/appCommands'
import { bibliographyFromSources } from '@databyss-org/data/pouchdb/hooks/useBibliography'
import { useContextSelector, createContext } from 'use-context-selector'
import { useNavigationContext } from '@databyss-org/ui/components'
import {
  bibliographyToMarkdown,
  blockToMarkdown,
  cleanFilename,
  escapeReserved,
  sourceToMarkdown,
} from '../markdown'
import {
  Source,
  AuthorName,
  BibliographyItem,
  Page,
  Document,
  DocumentDict,
  Block,
  BlockType,
  Group,
  Embed,
} from '../interfaces'
import { getCitationStyle } from '../citations/lib'
import { CitationStyle } from '../citations/constants'
import { validUriRegex } from '../lib/util'
import { loadPage } from '../editorPage'
import { getAccountFromLocation, RemoteDbInfo } from '../session/utils'
import { useDatabaseContext } from '../lib/DatabaseProvider'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('@databyss-org/desktop/src/eapi').default

type PublishDatabaseResult = 'success' | string

export interface ExportContextType {
  exportSinglePage: (id: string) => void
  exportAllPages: () => void
  exportBibliography: ({
    sourceId,
    author,
  }: {
    sourceId?: string | null
    author?: AuthorName | null
  }) => void
  exportDatabase: () => void
  setCurrentPageId: (pageId: string) => void
  publishGroupDatabase: (group: Group) => Promise<PublishDatabaseResult>
  unpublishGroupDatabase: (group: Group) => Promise<void>
  cancelPublishGroupDatabase: (group: Group) => Promise<void>
  exportDbToZip: () => Promise<void>
}

export const ExportContext = createContext<ExportContextType>(null!)

export const ExportProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const { notifySticky, hideSticky } = useNotifyContext()
  const { getPreferredCitationStyle } = useUserPreferencesContext()
  const sourcesInPagesRes = useBlocksInPages<Source>(BlockType.Source)
  const showModal = useNavigationContext((c) => c && c.showModal)
  const setGroup = useDatabaseContext((c) => c && c.setGroup)

  const pageIdRef = useRef<string | null>(null)

  const pagesRes = usePages({ subscribe: false })
  // const biblioRes = useBibliography({
  //   subscribe: false,
  //   formatOptions: {
  //     styleId: getPreferredCitationStyle(),
  //   },
  // })

  const setCurrentPageId = (pageId: string) => {
    pageIdRef.current = pageId
  }

  const exportPage = async ({
    page,
    zip,
    linkedDocuments,
  }: {
    page: Page
    zip: JSZip
    linkedDocuments: DocumentDict<Document>
  }) => {
    // load page dependencies (linked documents)
    const _docIdsToFetch: string[] = []
    page.blocks.forEach((_block) => {
      if (!linkedDocuments[_block._id]) {
        _docIdsToFetch.push(_block._id)
      }
      _block.text.ranges.forEach((_range) => {
        _range.marks.forEach((_mark) => {
          if (
            Array.isArray(_mark) &&
            _mark.length > 1 &&
            _mark[1] &&
            !_mark[1].match(validUriRegex) &&
            !linkedDocuments[_mark[1]]
          ) {
            _docIdsToFetch.push(_mark[1])
          }
        })
      })
    })
    const _linkedDocs = (await getDocuments<Document>(
      _docIdsToFetch
    )) as DocumentDict<Document>
    Object.assign(linkedDocuments, _linkedDocs)

    // serialize the blocks to markdown
    const _markdownDoc: string[] = []
    page.blocks.forEach((_block, _idx) => {
      _markdownDoc.push(
        blockToMarkdown({
          block: _block,
          linkedDocs: linkedDocuments,
          isTitle: _idx === 0,
        })
      )
    })

    zip.file(`${cleanFilename(page.name)}.md`, _markdownDoc.join('\n\n'))
  }

  const exportLinkedDocuments = async ({
    documents,
    zip,
  }: {
    documents: DocumentDict<Document>
    zip: JSZip
  }) => {
    const _c = cleanFilename
    for (const _doc of Object.values(documents)) {
      if (!_doc) {
        continue
      }
      const _doctype = (_doc as any).doctype
      if (_doctype === DocumentType.Block) {
        const _block = _doc as Block
        if (_block.type === BlockType.Topic) {
          zip.file(
            `t/${_c(_block.text.textValue)}.md`,
            `# ${escapeReserved(_block.text.textValue)}\n`
          )
        }
        if (_block.type === BlockType.Source) {
          const _source = _block as Source
          const _sourcemd = await sourceToMarkdown({
            source: _source,
            citationStyle: getCitationStyle(
              getPreferredCitationStyle()
            ) as CitationStyle,
          })
          zip.file(
            `s/${_c(_source.name?.textValue ?? _source.text.textValue)}.md`,
            _sourcemd
          )
        }
      }
    }
  }

  const exportSinglePage = async (id?: string) => {
    const _id = id ?? pageIdRef.current!
    // console.log('[ExportProvider] single page', _id)
    const _c = cleanFilename
    const _page = (await loadPage(_id)) as Page
    const _zip = new JSZip().folder(_c(_page.name))!
    const _linkedDocs = {}
    await exportPage({
      page: _page,
      zip: _zip,
      linkedDocuments: _linkedDocs,
    })
    await exportLinkedDocuments({
      documents: _linkedDocs,
      zip: _zip,
    })

    const _zipContent = await _zip.generateAsync({ type: 'arraybuffer' })
    fileDownload(_zipContent, `${_c(_page.name)}.zip`)
  }

  const exportAllPages = async () => {
    const _zip = new JSZip().folder('collection')!
    const _linkedDocs = {}
    notifySticky({
      visible: true,
      children: (
        <Text variant="uiTextSmall" color="text.2">
          Your export is being prepared and will download when complete.
        </Text>
      ),
    })
    const biblio = await bibliographyFromSources(sourcesInPagesRes.data!, {
      styleId: getPreferredCitationStyle(),
    })
    _zip.file(
      's/@bibliography.md',
      bibliographyToMarkdown({
        bibliography: biblio!,
        citationStyle: getCitationStyle(getPreferredCitationStyle()),
      })
    )

    const pagesDict = (await pagesRes.refetch()).data
    for (const _pageHeader of Object.values(pagesDict!)) {
      if (_pageHeader.archive) {
        continue
      }
      const _page = (await loadPage(_pageHeader._id)) as Page
      await exportPage({
        page: _page,
        zip: _zip,
        linkedDocuments: _linkedDocs,
      })
      await exportLinkedDocuments({
        documents: _linkedDocs,
        zip: _zip,
      })
    }
    const _zipContent = await _zip.generateAsync({ type: 'arraybuffer' })
    hideSticky()
    fileDownload(_zipContent, `collection.zip`)
  }

  const downloadBibliography = async ({
    items,
    author,
    styleId,
  }: {
    items: BibliographyItem[]
    author?: AuthorName
    styleId?: string
  }) => {
    // console.log('[ExportProvider] downloadBibliography', items, author, styleId)
    fileDownload(
      bibliographyToMarkdown({
        bibliography: items,
        author,
        ...(styleId ? { citationStyle: getCitationStyle(styleId) } : {}),
      }),
      author
        ? `bibliography (${cleanFilename(
            author.lastName ?? author.firstName ?? ''
          )}).md`
        : 'bibliography.md'
    )
  }

  const downloadSourceMarkdown = async ({
    sourceId,
    styleId,
  }: {
    sourceId: string
    styleId: string
  }) => {
    const _source = await getDocument<Source>(sourceId)
    const _sourcemd = await sourceToMarkdown({
      source: _source!,
      citationStyle: getCitationStyle(styleId) as CitationStyle,
    })
    const _filename = cleanFilename(_source!.text.textValue)
    fileDownload(_sourcemd, `${_filename}.md`)
  }

  const exportBibliography = async (options?: {
    author: AuthorName
    sourceId: string
  }) => {
    const author = options?.author
    const sourceId = options?.sourceId
    const biblio = await bibliographyFromSources(sourcesInPagesRes.data!, {
      styleId: getPreferredCitationStyle(),
    })
    if (!sourceId) {
      // bibliography (full or filtered by author)
      await downloadBibliography({
        items: biblio!,
        author,
        styleId: getPreferredCitationStyle(),
      })
    } else {
      // export single source
      await downloadSourceMarkdown({
        sourceId,
        styleId: getPreferredCitationStyle(),
      })
    }
  }

  const exportDbToZip = async () => {
    const _dbRef = dbRef.current!
    const _zip = new JSZip()!
    const { rows } = await _dbRef.allDocs({ include_docs: true })
    // collect rows and add media to zip
    const _docs: DbDocument[] = []
    for (const _row of rows) {
      const _d: DbDocument = _row.doc
      _docs.push(_d)
      if (_d.type === BlockType.Embed) {
        const _embed = (_d as unknown) as Embed
        if (!_embed.detail.fileDetail) {
          continue
        }
        // check that remote media exists
        let _mediaRes
        try {
          _mediaRes = await fetch(_embed.detail.src, { method: 'HEAD' })
        } catch (err) {
          console.warn('[exportDbToZip] error fetching media', _embed)
        }
        if (!_mediaRes || !_mediaRes.ok) {
          continue
        }
        // fetch remote media and add to zip
        _mediaRes = await fetch(_embed.detail.src)
        const _buf = await _mediaRes.arrayBuffer()
        const _filename = _embed.detail.fileDetail.filename
        _zip.file(`media/${_embed._id}/${_filename}`, _buf, {
          binary: true,
        })
        // rewrite src to indicate local media
        _embed.detail.src = `dbdrive://${dbRef.groupId}/${_embed._id}/${_filename}`
      }
    }
    _zip.file('db.json', JSON.stringify(_docs, null, 2))
    const _zipContent = await _zip.generateAsync({ type: 'arraybuffer' })
    return _zipContent
  }

  const exportDatabase = async () => {
    const _groupId = getAccountFromLocation() as string

    // get the group name
    const _group = (await dbRef.current!.get(_groupId)) as Group

    // generate zip of db
    const _zipContent = await exportDbToZip()

    // download the zip to client
    const _filename = makeBackupFilename(_groupId, _group.name)
    fileDownload(_zipContent, `${_filename}.zip`)
  }

  const cancelPublishGroupDatabase = useCallback(
    async (group: Group) => {
      await eapi.publish.cancelPublishGroup(group._id)
    },
    [setGroup, eapi.publish?.cancelPublishGroup]
  )

  const unpublishGroupDatabase = useCallback((group: Group) =>
    eapi.publish.unpublishGroup(group._id)
  )

  const publishGroupDatabase = useCallback(
    async (group: Group) => {
      // console.log('[publishGroupDatabase]', group)
      try {
        const _publishRes: RemoteDbInfo = await eapi.publish.publishGroup(
          group._id,
          group._id
        )
        if (_publishRes) {
          group.lastPublishedAt = _publishRes.publishedAt
          await setGroup(group)
        }
      } catch (err) {
        console.warn('[publishGroupDatabase] error', err)
      }
      // console.log('[publishGroupDatabase] result', _publishRes)
    },
    [setGroup]
  )

  const showExportModal = useCallback(() => {
    showModal({
      component: 'EXPORTDB',
      visible: true,
    })
  }, [showModal])

  useEffect(() => {
    appCommands.addListener('exportModal', showExportModal)
    return () => {
      appCommands.removeListener('exportModal', exportAllPages)
    }
  }, [])

  return (
    <ExportContext.Provider
      value={{
        exportSinglePage,
        exportAllPages,
        exportBibliography,
        exportDatabase,
        setCurrentPageId,
        publishGroupDatabase,
        unpublishGroupDatabase,
        cancelPublishGroupDatabase,
      }}
    >
      {children}
    </ExportContext.Provider>
  )
}

export const useExportContext = (selector = (x) => x) =>
  useContextSelector(ExportContext, selector)
