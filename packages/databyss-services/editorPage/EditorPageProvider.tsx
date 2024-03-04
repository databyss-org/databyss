import React, { useRef, useEffect, useCallback, Ref } from 'react'
import { createContext, useContextSelector } from 'use-context-selector'
import scrollIntoView from 'scroll-into-view-if-needed'
import savePatchBatch from '@databyss-org/data/pouchdb/pages/lib/savePatchBatch'
import { setPublicPage } from '@databyss-org/data/pouchdb/groups'
import { usePages } from '@databyss-org/data/pouchdb/hooks'
import {
  useParams,
  useNavigationContext,
} from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { updateAccessedAt } from '@databyss-org/data/pouchdb/utils'
import { uid } from '@databyss-org/data/lib/uid'
import { useQueryClient } from '@tanstack/react-query'
import { selectors } from '@databyss-org/data/pouchdb/selectors'
import createReducer from '../lib/createReducer'
import reducer, { initialState as _initState } from './reducer'
import { ResourcePending } from '../interfaces/ResourcePending'
import {
  Page,
  PageState,
  PatchBatch,
  ResourceResponse,
  ResourceNotFoundError,
  BlockType,
  Block,
} from '../interfaces'
// import { PageReplicator } from './PageReplicator'
import * as actions from './actions'
import { useSessionContext } from '../session/SessionProvider'
import { uploadEmbed } from '../embeds'
import { InlineTypes } from '../interfaces/Range'

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
  setPatches: (patches: PatchBatch) => void
  getPublicAccount: (id: string) => string | string[]
  archivePage: (id: string, boolean: boolean) => Promise<void>
  onPageCached: (id: string, callback: Function) => void
  removePageFromCache: (id: string) => void
  sharedWithGroupsRef: Ref<string[] | null>
  sharedWithGroups?: string[]
  setFocusIndex: (index: number) => void
  setLastBlockRendered: () => void
  focusIndex: number
  embedFile: (file: File) => Promise<Block>
}

const useReducer = createReducer()
export const EditorPageContext = createContext<ContextType>(null!)

export const EditorPageProvider: React.FunctionComponent<PropsType> = ({
  children,
  initialState = _initState,
}: PropsType) => {
  const sharedWithGroupsRef = useRef<string[] | null>(null)
  const pageCachedHookRef: React.Ref<PageHookDict> = useRef({})
  const pagesRes = usePages()
  const navigate = useNavigationContext((c) => c && c.navigate)
  const location = useNavigationContext((c) => c && c.location)
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)
  const getTokensFromPath = useNavigationContext((c) => c.getTokensFromPath)
  const { anchor } = getTokensFromPath()
  const queryClient = useQueryClient()

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
    queryClient.setQueryData([selectors.PAGES], (oldData) =>
      oldData
        ? {
            ...oldData,
            [page._id]: {
              ...oldData[page._id],
              ...page,
              accessedAt: Date.now(),
              modifiedAt: Date.now(),
            },
          }
        : oldData
    )
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
      if (!isPublicAccount()) {
        updateAccessedAt(id, queryClient, selectors.PAGES)
      }
      dispatch(actions.fetchPage(id, firstBlockIsTitle))

      return null
    },
    [JSON.stringify(state.cache), pagesRes.data]
  )

  const deletePage = (id: string) => {
    queryClient.setQueryData([selectors.PAGES], (oldData: any) => {
      const nextData = { ...oldData }
      delete nextData[id]
      return nextData
    })
    dispatch(actions.deletePage(id))
  }

  const archivePage = useCallback(
    (id: string, boolean: boolean): Promise<void> =>
      new Promise((res) => {
        queryClient.setQueryData([selectors.PAGES], (oldData: any) => ({
          ...oldData,
          [id]: { ...oldData[id], archive: boolean },
        }))
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

  const focusIndex = anchor && parseInt(anchor, 10)

  const setLastBlockRendered = () => {
    if (!focusIndex) {
      return
    }
    window.requestAnimationFrame(() => {
      scrollIntoView(document.getElementsByName(focusIndex.toString())[0])
      navigate(location.pathname, { replace: true })
    })
  }

  const setFocusIndex = (index: number, last?: boolean) => {
    dispatch(actions.setFocusIndex(index))
    if (last) {
      setLastBlockRendered()
    }
  }

  const embedFile = async (file: File) => {
    // console.log('[embedFile]', file)
    const embed = await uploadEmbed(file)
    const block: Block = {
      _id: uid(),
      type: BlockType.Entry,
      text: {
        textValue: embed.text.textValue,
        ranges: [
          {
            length: embed.text.textValue.length,
            offset: 0,
            marks: [[InlineTypes.Embed, embed._id]],
          },
        ],
      },
    }
    return block
  }

  return (
    <EditorPageContext.Provider
      value={{
        getPage,
        setPage,
        setPageHeader,
        setPatches,
        deletePage,
        archivePage,
        onPageCached,
        setPagePublic,
        removePageFromCache,
        getPublicAccount,
        sharedWithGroupsRef,
        sharedWithGroups: sharedWithGroupsRef.current ?? [],
        setFocusIndex,
        focusIndex,
        setLastBlockRendered,
        embedFile,
      }}
    >
      {/* <PageReplicator key={pageId} pageId={pageId}> */}
      {children}
      {/* </PageReplicator> */}
    </EditorPageContext.Provider>
  )
}

export const useEditorPageContext = (
  selector: { (x: ContextType): any } = (x: ContextType) => x
) => useContextSelector(EditorPageContext, selector)
