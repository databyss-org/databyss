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
import { getDocuments } from '@databyss-org/data/pouchdb/utils'
import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import { useBlocksInPages, usePages } from '@databyss-org/data/pouchdb/hooks'
import {
  backupDbToJson,
  makeBackupFilename,
} from '@databyss-org/data/pouchdb/backup'
import { dbRef } from '@databyss-org/data/pouchdb/db'
import { useUserPreferencesContext } from '@databyss-org/ui/hooks'
import { appCommands } from '@databyss-org/ui/lib/appCommands'
import { bibliographyFromSources } from '@databyss-org/data/pouchdb/hooks/useBibliography'
import { setGroup } from '@databyss-org/data/pouchdb/groups'
import { useContextSelector, createContext } from 'use-context-selector'
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
} from '../interfaces'
import { getCitationStyle } from '../citations/lib'
import { CitationStyle } from '../citations/constants'
import { validUriRegex } from '../lib/util'
import { loadPage } from '../editorPage'
import { getAccountFromLocation } from '../session/utils'
import { uid } from '@databyss-org/data/lib/uid'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('@databyss-org/desktop/src/eapi').default

type PublishDatabaseResult = 'success' | string

interface ContextType {
  exportSinglePage: (id: string) => void
  exportAllPages: () => void
  exportBibliography: ({
    source,
    author,
  }: {
    source: Source
    author: AuthorName
  }) => void
  exportDatabase: () => void
  setCurrentPageId: (pageId: string) => void
  publishGroupDatabase: (group: Group) => Promise<PublishDatabaseResult>
  cancelPublishGroupDatabase: (group: Group) => Promise<void>
}

export const ExportContext = createContext<ContextType>(null!)

export const ExportProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const { notifySticky, hideSticky } = useNotifyContext()
  const { getPreferredCitationStyle } = useUserPreferencesContext()
  const sourcesInPagesRes = useBlocksInPages<Source>(BlockType.Source)

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
    console.log('[ExportProvider] single page', _id)
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
    console.log('[ExportProvider] downloadBibliography', items, author, styleId)
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
    source,
    styleId,
  }: {
    source: Source
    styleId: string
  }) => {
    const _sourcemd = await sourceToMarkdown({
      source,
      citationStyle: getCitationStyle(styleId) as CitationStyle,
    })
    const _filename = cleanFilename(source.text.textValue)
    fileDownload(_sourcemd, `${_filename}.md`)
  }

  const exportBibliography = async (options?: {
    author: AuthorName
    source: Source
  }) => {
    const author = options?.author
    const source = options?.source
    const biblio = await bibliographyFromSources(sourcesInPagesRes.data!, {
      styleId: getPreferredCitationStyle(),
    })
    if (!source) {
      // bibliography (full or filtered by author)
      await downloadBibliography({
        items: biblio!,
        author,
        styleId: getPreferredCitationStyle(),
      })
    } else {
      // export single source
      await downloadSourceMarkdown({
        source,
        styleId: getPreferredCitationStyle(),
      })
    }
  }

  const exportDatabase = async () => {
    const groupId = getAccountFromLocation() as string
    notifySticky({
      visible: true,
      children: (
        <Text variant="uiTextSmall" color="text.2">
          Your export is being prepared and will download when complete.
        </Text>
      ),
    })
    const name = makeBackupFilename(groupId)
    const dbJson = await backupDbToJson(dbRef.current!)
    // ZIPping the file doesn't seem to do much
    // const zip = new JSZip()
    // zip.file(name, dbJson)
    // const zipContent = await zip.generateAsync({ type: 'arraybuffer' })
    hideSticky()
    fileDownload(dbJson, `${name}.json`)
  }

  const cancelPublishGroupDatabase = useCallback(
    async (group: Group) => {
      if (!group.publishingStatusId) {
        return
      }
      await eapi.publish.cancelPublishGroup(group.publishingStatusId)
      group.isPublishing = false
      await setGroup(group)
    },
    [setGroup, eapi.publish.cancelPublishGroup]
  )

  const publishGroupDatabase = useCallback(
    async (group: Group) => {
      group.isPublishing = true
      group.publishingStatusId = uid()
      await setGroup(group)
      console.log('[publishGroupDatabase]', group)
      const _publishRes = await eapi.publish.publishGroup(
        group._id,
        group.publishingStatusId
      )
      console.log('[publishGroupDatabase] result', _publishRes)

      group.lastPublishedAt = new Date().toUTCString()
      group.isPublishing = false
      // group.lastPublishResult = 'success'

      await setGroup(group)
    },
    [setGroup]
  )

  useEffect(() => {
    appCommands.addListener('exportAllAsMarkdown', exportAllPages)
    appCommands.addListener('exportBibliography', exportBibliography)
    appCommands.addListener('exportDatabase', exportDatabase)
    appCommands.addListener('exportPageAsMarkdown', exportSinglePage)
    return () => {
      appCommands.removeListener('exportAllAsMarkdown', exportAllPages)
      appCommands.removeListener('exportBibliography', exportBibliography)
      appCommands.removeListener('exportDatabase', exportDatabase)
      appCommands.removeListener('exportPageAsMarkdown', exportSinglePage)
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
        cancelPublishGroupDatabase,
      }}
    >
      {children}
    </ExportContext.Provider>
  )
}

export const useExportContext = (selector = (x) => x) =>
  useContextSelector(ExportContext, selector)
