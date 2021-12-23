import React, { useRef, useEffect, useCallback } from 'react'
import JSZip from 'jszip'
import { createContext, useContextSelector } from 'use-context-selector'
import fileDownload from 'js-file-download'
import savePatchBatch from '@databyss-org/data/pouchdb/pages/lib/savePatchBatch'
import { setPublicPage } from '@databyss-org/data/pouchdb/groups'
import { usePages } from '@databyss-org/data/pouchdb/hooks'
import { useParams } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import createReducer from '../lib/createReducer'
import reducer, { initialState as _initState } from './reducer'
import { ResourcePending } from '../interfaces/ResourcePending'
import {
  Page,
  PageState,
  RefDict,
  PatchBatch,
  ResourceResponse,
  ResourceNotFoundError,
  Document,
  DocumentDict,
  Block,
  BlockType,
  Source,
} from '../interfaces'
import { PageReplicator } from './PageReplicator'
import * as actions from './actions'
import { loadPage } from './'
import { validUriRegex } from '../lib/util'
import { getDocuments } from '../../databyss-data/pouchdb/utils'
import { blockToMarkdown, sourceToMarkdown } from '../markdown'
import { DocumentType } from '../../databyss-data/pouchdb/interfaces'
import { getCitationStyle } from '../citations/lib'
import { CitationStyle } from '../citations/constants'

interface PropsType {
  children: JSX.Element
  initialState: PageState
}

interface PageHookDict {
  [key: string]: Function
}

interface ContextType {
  setPagePublic: (id: string, bool: boolean, accountId: string) => void
  setPage: (page: Page) => void
  deletePage: (id: string) => void
  setPageHeader: (page: Page) => void
  getPage: (
    id: string,
    firstBlockIsTitle: boolean
  ) => Page | ResourcePending | null
  clearBlockDict: () => void
  setPatches: (patches: PatchBatch) => void
  registerBlockRefByIndex: (
    index: number,
    refOne: React.Ref<HTMLInputElement>
  ) => void
  getBlockRefByIndex: (index: number) => React.Ref<HTMLInputElement>
  getPublicAccount: (id: string) => string | string[]
  archivePage: (id: string, boolean: boolean) => Promise<void>
  onPageCached: (id: string, callback: Function) => void
  removePageFromCache: (id: string) => void
  exportPage: (id: string) => void
  sharedWithGroups?: string[]
}

const useReducer = createReducer()
export const EditorPageContext = createContext<ContextType>(null!)

export const EditorPageProvider: React.FunctionComponent<PropsType> = ({
  children,
  initialState = _initState,
}: PropsType) => {
  const refDictRef = useRef<RefDict>({})
  const sharedWithGroupsRef = useRef<string[] | null>(null)
  const pageCachedHookRef: React.Ref<PageHookDict> = useRef({})
  const pagesRes = usePages()

  const pageIdParams = useParams()
  let pageId
  if (pageIdParams) {
    pageId = pageIdParams.id
  }

  const [state, dispatch] = useReducer(reducer, initialState)

  // instead of pageDependencyObserver, keep a reference to the `sharedWithGroups`
  //   for the page and use this value whenever a new block (or topic or source) is created
  useEffect(() => {
    const _groups = (pagesRes.data?.[pageId] as any)?.sharedWithGroups
    // console.log('[EditorPageProvider] sharedWithGroups changed', _groups)
    sharedWithGroupsRef.current = _groups
  }, [
    JSON.stringify(
      [...((pagesRes.data?.[pageId] as any)?.sharedWithGroups ?? [])].sort()
    ),
  ])

  useEffect(() => {
    if (pageCachedHookRef.current) {
      Object.keys(pageCachedHookRef.current).forEach((k) => {
        if (state.cache[k] && pageCachedHookRef.current) {
          // execute callback
          pageCachedHookRef.current[k]()
          // remove from queue
          delete pageCachedHookRef.current[k]
        }
      })
    }
  }, [state.cache])

  const onPageCached = (id: string, callback: Function) => {
    // add back to dictionary
    if (pageCachedHookRef.current) {
      pageCachedHookRef.current[id] = callback
    }
  }

  const setPage = useCallback(
    (page: Page): Promise<void> =>
      new Promise((res) => {
        onPageCached(page._id, res)
        dispatch(actions.savePage(page))
      }),
    []
  )

  const setPageHeader = useCallback((page: Page) => {
    dispatch(actions.savePageHeader(page))
  }, [])

  const getPage = useCallback(
    (id: string, firstBlockIsTitle: boolean): ResourceResponse<Page> => {
      if (state.cache[id]) {
        const _pouchPage = pagesRes?.data?.[id]

        if (!_pouchPage && pagesRes.isSuccess) {
          // page was removed from pouch
          return new ResourceNotFoundError('')
        }
        return state.cache[id]
      }
      dispatch(actions.fetchPage(id, firstBlockIsTitle))
      return null
    },
    [JSON.stringify(state.cache), pagesRes.data]
  )

  const registerBlockRefByIndex = useCallback(
    (index: number, ref: React.Ref<HTMLInputElement>) => {
      refDictRef.current[index] = ref
    },
    []
  )

  const getBlockRefByIndex = useCallback((index: number) => {
    if (refDictRef.current[index]) {
      return refDictRef.current[index]
    }
    return null
  }, [])

  const clearBlockDict = useCallback(() => {
    refDictRef.current = {}
  }, [])

  const deletePage = (id: string) => {
    dispatch(actions.deletePage(id))
  }

  const archivePage = useCallback(
    (id: string, boolean: boolean): Promise<void> =>
      new Promise((res) => {
        dispatch(actions.onArchivePage(id, state.cache[id], boolean, res))
      }),
    [state.cache]
  )

  const setPatches = (patches: PatchBatch) => {
    if (patches) {
      savePatchBatch(patches, sharedWithGroupsRef.current ?? [])
    }
  }

  const removePageFromCache = (id: string) => {
    dispatch(actions.removePageFromCache(id))
  }

  const setPagePublic = (id: string, bool: boolean) => {
    setPublicPage(id, bool)
  }

  const getPublicAccount = useCallback(
    (id: string) =>
      state.cache[id].publicAccountId ? state.cache[id].publicAccountId : [],
    [JSON.stringify(state.cache)]
  )

  const exportPage = async (id: string) => {
    const _page = (await loadPage(id)) as Page

    // load page dependencies (linked documents)
    const _docIdsToFetch: string[] = []
    _page.blocks.forEach((_block) => {
      _docIdsToFetch.push(_block._id)
      _block.text.ranges.forEach((_range) => {
        _range.marks.forEach((_mark) => {
          if (
            Array.isArray(_mark) &&
            _mark.length > 1 &&
            !_mark[1].match(validUriRegex)
          ) {
            _docIdsToFetch.push(_mark[1])
          }
        })
      })
    })
    const _linkedDocs = (await getDocuments<Document>(
      _docIdsToFetch
    )) as DocumentDict<Document>

    // serialize the blocks to markdown
    const _markdownDoc: string[] = []
    _page.blocks.forEach((_block) => {
      _markdownDoc.push(
        blockToMarkdown({ block: _block, linkedDocs: _linkedDocs })
      )
    })

    const _zip = new JSZip().folder(_page.name)!
    for (const _doc of Object.values(_linkedDocs)) {
      const _doctype = (_doc as any).doctype
      if (_doctype === DocumentType.Block) {
        const _block = _doc as Block
        if (_block.type === BlockType.Topic) {
          _zip.file(`t/${_block.text.textValue}.md`, '')
        }
        if (_block.type === BlockType.Source) {
          const _source = _block as Source
          const _sourcemd = await sourceToMarkdown({
            source: _source,
            citationStyle: getCitationStyle('apa') as CitationStyle,
          })
          _zip.file(`s/${_source.name?.textValue}.md`, _sourcemd)
        }
      }
    }

    _zip.file(`${_page.name}.md`, _markdownDoc.slice(1).join('\n\n'))
    const _zipContent = await _zip.generateAsync({ type: 'arraybuffer' })
    fileDownload(_zipContent, `${_page.name}.zip`)
  }

  return (
    <EditorPageContext.Provider
      value={{
        getPage,
        setPage,
        setPageHeader,
        setPatches,
        registerBlockRefByIndex,
        getBlockRefByIndex,
        clearBlockDict,
        deletePage,
        archivePage,
        onPageCached,
        setPagePublic,
        removePageFromCache,
        getPublicAccount,
        sharedWithGroups: sharedWithGroupsRef.current ?? [],
        exportPage,
      }}
    >
      <PageReplicator key={pageId} pageId={pageId}>
        {children}
      </PageReplicator>
    </EditorPageContext.Provider>
  )
}

export const useEditorPageContext = (selector = (x: ContextType) => x) =>
  useContextSelector(EditorPageContext, selector)
