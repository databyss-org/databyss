import React, {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useRef,
} from 'react'
import fileDownload from 'js-file-download'
import JSZip from 'jszip'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'
import { Text } from '@databyss-org/ui/primitives'
import { getDocument, getDocuments } from '@databyss-org/data/pouchdb/utils'
import { DbDocument, DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import { Role } from '@databyss-org/data/interfaces/sysUser'
import { useBibliography, usePages } from '@databyss-org/data/pouchdb/hooks'
import { dbRef } from '@databyss-org/data/pouchdb/db'
import { getFileUrl } from '@databyss-org/data/drivedb/files'
import { useUserPreferencesContext } from '@databyss-org/ui/hooks'
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
  Embed,
} from '../interfaces'
import { getCitationStyle } from '../citations/lib'
import { CitationStyle } from '../citations/constants'
import { sleep, validUriRegex } from '../lib/util'
import { loadPage } from '../editorPage'
import { getAccountId } from '../session/clientStorage'
import { getAccountFromLocation } from '../session/utils'

function fixedEncodeURIComponent(str: string) {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16)}`
  )
}

interface ContextType {
  exportSinglePage: (id?: string) => void
  exportAllPages: () => void
  exportBibliography: ({
    sourceId,
    source,
    author,
  }: {
    sourceId?: string | null
    source?: Source | null
    author?: AuthorName | null
  }) => void
  exportDatabase: () => void
  exportDbToZip: () => Promise<ArrayBuffer>
  setCurrentPageId: (pageId: string | null) => void
}

export const ExportContext = createContext<ContextType>(null!)

export const ExportProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const { notifySticky, hideSticky } = useNotifyContext()
  const { getPreferredCitationStyle } = useUserPreferencesContext()
  const pageIdRef = useRef<string | null>(null)

  const pagesRes = usePages({ subscribe: false })
  const biblioRes = useBibliography({
    subscribe: false,
    formatOptions: {
      styleId: getPreferredCitationStyle(),
    },
  })

  const setCurrentPageId = (pageId: string | null) => {
    pageIdRef.current = pageId
  }

  const rewriteMarkdownEmbedMedia = async ({
    linkedDocuments,
    zip,
  }: {
    linkedDocuments: DocumentDict<Document>
    zip: JSZip
  }) => {
    const _groupId = getAccountId() ?? getAccountFromLocation()

    for (const _doc of Object.values(linkedDocuments)) {
      const _embed = _doc as Embed
      if (!_embed || _embed.type !== BlockType.Embed) {
        continue
      }

      const _fileDetail = _embed?.detail?.fileDetail
      if (!_embed?._id || !_fileDetail?.filename || !_fileDetail?.storageKey) {
        continue
      }

      // If this embed was already localized in a previous page export pass,
      // keep the relative path and avoid refetching/re-overwriting bytes.
      if (_embed.detail?.src?.startsWith('media/')) {
        continue
      }

      const _fetchCandidates: string[] = []
      if (_embed.detail?.src && !_embed.detail.src.startsWith('media/')) {
        _fetchCandidates.push(_embed.detail.src)
      }

      try {
        if (_groupId) {
          const _resolvedUrl = await getFileUrl(
            _groupId,
            _fileDetail.storageKey
          )
          if (_resolvedUrl) {
            _fetchCandidates.push(_resolvedUrl)
          }
        }
      } catch {
        // fallback to available candidates
      }

      let _mediaRes: Response | null = null
      for (const _url of _fetchCandidates) {
        try {
          const _res = await fetch(_url)
          if (_res.ok) {
            _mediaRes = _res
            break
          }
        } catch {
          // try next candidate
        }
      }

      if (!_mediaRes) {
        continue
      }

      const _filename = fixedEncodeURIComponent(_fileDetail.filename)
      const _relativePath = `media/${_embed._id}/${_filename}`
      const _buffer = await _mediaRes.arrayBuffer()
      zip.file(_relativePath, _buffer, { binary: true })

      // blockToMarkdown emits embed.detail.src for inline embeds.
      _embed.detail.src = _relativePath
    }
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

    await rewriteMarkdownEmbedMedia({
      linkedDocuments,
      zip,
    })

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
    const _id = id ?? pageIdRef.current
    if (!_id) {
      return
    }
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
    const biblioDict = (await biblioRes.refetch()).data
    _zip.file(
      's/@bibliography.md',
      bibliographyToMarkdown({
        bibliography: Object.values(biblioDict!),
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
    source,
    styleId,
  }: {
    sourceId?: string
    source?: Source | null
    styleId: string
  }) => {
    const _source =
      source ?? (sourceId ? await getDocument<Source>(sourceId) : null)
    if (!_source) {
      return
    }
    const _sourcemd = await sourceToMarkdown({
      source: _source,
      citationStyle: getCitationStyle(styleId) as CitationStyle,
    })
    const _filename = cleanFilename(_source.text.textValue)
    fileDownload(_sourcemd, `${_filename}.md`)
  }

  const exportBibliography = async ({
    sourceId,
    author,
    source,
  }: {
    sourceId?: string | null
    author?: AuthorName | null
    source?: Source | null
  }) => {
    while (biblioRes.isFetching) {
      await sleep(500)
    }
    if (!source && !sourceId) {
      // bibliography (full or filtered by author)
      await downloadBibliography({
        items: Object.values(biblioRes.data!),
        author: author ?? undefined,
        styleId: getPreferredCitationStyle(),
      })
    } else {
      // export single source
      await downloadSourceMarkdown({
        sourceId: sourceId ?? undefined,
        source,
        styleId: getPreferredCitationStyle(),
      })
    }
  }

  const exportDbToZip = async (): Promise<ArrayBuffer> => {
    const _dbRef = dbRef.current!
    const _zip = new JSZip()
    const _resolvedGroupId = getAccountId() ?? getAccountFromLocation()
    const { rows } = await _dbRef.allDocs({ include_docs: true })

    const _docs: DbDocument[] = []
    let _skippedMalformedEmbeds = 0
    for (const _row of rows) {
      const _doc = _row.doc as DbDocument
      if (!_doc?._id) {
        continue
      }

      if (_doc.type !== BlockType.Embed) {
        _docs.push(_doc)
        continue
      }

      const _embed = (_doc as unknown) as Embed
      const _fileDetail = _embed?.detail?.fileDetail
      const _src = _embed?.detail?.src
      const _isDbDriveEmbed =
        typeof _src === 'string' && _src.startsWith('dbdrive://')

      // Preserve non-file embeds (website/twitter/html) as-is.
      if (!_fileDetail && !_isDbDriveEmbed) {
        _docs.push(_doc)
        continue
      }

      if (!_embed?._id || !_fileDetail?.filename || !_fileDetail?.storageKey) {
        _skippedMalformedEmbeds += 1
        continue
      }

      _docs.push(_doc)

      const _fetchCandidates: string[] = []
      if (_embed?.detail?.src) {
        _fetchCandidates.push(_embed.detail.src)
      }

      // Resolve dbdrive refs through DriveDB to an object URL that can be fetched.
      try {
        const _groupId = _resolvedGroupId
        if (_groupId) {
          const _resolvedUrl = await getFileUrl(
            _groupId,
            _fileDetail.storageKey
          )
          if (_resolvedUrl) {
            _fetchCandidates.push(_resolvedUrl)
          }
        }
      } catch {
        // fallback to the other candidates below
      }

      let _mediaRes: Response | null = null
      for (const _url of _fetchCandidates) {
        try {
          const _res = await fetch(_url)
          if (_res.ok) {
            _mediaRes = _res
            break
          }
        } catch {
          // try next url candidate
        }
      }

      if (!_mediaRes) {
        continue
      }

      const _buffer = await _mediaRes.arrayBuffer()
      const _filename = _fileDetail.filename
      _zip.file(`media/${_embed._id}/${_filename}`, _buffer, {
        binary: true,
      })

      // src is normalized after user_preference belongsToGroup is finalized.
    }

    const _docsForExport = _docs.filter((_doc) => {
      if (!_doc || typeof _doc._id !== 'string' || !_doc._id) {
        return false
      }

      // Exclude local/index design docs that are environment-specific and
      // can break legacy importers.
      if (_doc._id.startsWith('_design/') || _doc._id.startsWith('_local/')) {
        return false
      }

      const _asAny = _doc as any
      const _hasFileDetail = !!_asAny?.detail?.fileDetail
      const _src = _asAny?.detail?.src
      const _isDbDriveEmbed =
        typeof _src === 'string' && _src.startsWith('dbdrive://')
      const _isEmbedLike =
        _asAny?.type === BlockType.Embed ||
        _asAny?.type === 'EMBED' ||
        (_asAny?.doctype === DocumentType.Block && _hasFileDetail)

      if (!_isEmbedLike) {
        return true
      }

      // Keep non-file embeds; only strict-validate file-backed/dbdrive embeds.
      if (!_hasFileDetail && !_isDbDriveEmbed) {
        return true
      }

      const _fileDetail = _asAny?.detail?.fileDetail
      return !!_fileDetail?.filename && !!_fileDetail?.storageKey
    })

    const _finalFiltered = _docs.length - _docsForExport.length
    if (_finalFiltered > 0) {
      console.warn(
        `[exportDbToZip] removed ${_finalFiltered} incompatible docs before writing db.json`
      )
    }

    const _prefsDoc = _docsForExport.find(
      (_doc) =>
        _doc._id === 'user_preference' &&
        _doc.doctype === DocumentType.UserPreferences
    ) as any
    const _groupDocs = _docsForExport.filter(
      (_doc) => _doc.doctype === DocumentType.Group
    )
    if (_prefsDoc && _groupDocs.length > 0) {
      const _groupIds = new Set(_groupDocs.map((_g) => _g._id))
      const _groups = Array.isArray(_prefsDoc.groups)
        ? _prefsDoc.groups.filter(
            (_g: any) =>
              _g && typeof _g.groupId === 'string' && _groupIds.has(_g.groupId)
          )
        : []

      let _belongsToGroup =
        typeof _prefsDoc.belongsToGroup === 'string' &&
        _groupIds.has(_prefsDoc.belongsToGroup)
          ? _prefsDoc.belongsToGroup
          : null

      if (!_belongsToGroup) {
        _belongsToGroup = _groups[0]?.groupId ?? _groupDocs[0]._id
      }

      const _adminGroup = _groups.find(
        (_g: any) =>
          _g.groupId === _belongsToGroup && _g.role === Role.GroupAdmin
      )
      if (!_adminGroup) {
        const _groupEntry = _groups.find(
          (_g: any) => _g.groupId === _belongsToGroup
        )
        if (_groupEntry) {
          _groupEntry.role = Role.GroupAdmin
        } else {
          const _firstPage = _docsForExport.find(
            (_doc) => _doc.doctype === DocumentType.Page
          )
          _groups.unshift({
            groupId: _belongsToGroup,
            defaultPageId: _firstPage?._id ?? '',
            role: Role.GroupAdmin,
          })
        }
      }

      _prefsDoc.groups = _groups
      _prefsDoc.belongsToGroup = _belongsToGroup
      console.warn('[exportDbToZip] normalized user_preference group refs', {
        belongsToGroup: _belongsToGroup,
        groupsCount: _groups.length,
      })
    }

    const _exportGroupId =
      _prefsDoc?.belongsToGroup ?? _resolvedGroupId ?? _groupDocs[0]?._id
    if (_exportGroupId) {
      _docsForExport.forEach((_doc) => {
        const _asAny = _doc as any
        if (
          _asAny?.doctype === DocumentType.Block &&
          _asAny?.type === BlockType.Embed &&
          _asAny?._id &&
          _asAny?.detail?.fileDetail?.filename
        ) {
          const _filename = fixedEncodeURIComponent(
            _asAny.detail.fileDetail.filename
          )
          _asAny.detail.src = `dbdrive://${_exportGroupId}/${_asAny._id}/${_filename}`
        }
      })
    }

    if (_skippedMalformedEmbeds > 0) {
      console.warn(
        `[exportDbToZip] skipped ${_skippedMalformedEmbeds} malformed embed docs from export`
      )
    }

    _zip.file('db.json', JSON.stringify(_docsForExport, null, 2))
    return _zip.generateAsync({ type: 'arraybuffer' })
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
    const name = `databyss-db-${groupId.substring(
      2
    )}-${new Date()
      .toISOString()
      .replace('T', '_')
      .replace(/:/g, '')
      .substring(0, 17)}`
    const zipContent = await exportDbToZip()
    hideSticky()
    fileDownload(zipContent, `${name}.zip`)
  }

  return (
    <ExportContext.Provider
      value={{
        exportSinglePage,
        exportAllPages,
        exportBibliography,
        exportDatabase,
        exportDbToZip,
        setCurrentPageId,
      }}
    >
      {children}
    </ExportContext.Provider>
  )
}

export const useExportContext = () => useContext(ExportContext)
