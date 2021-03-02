import React, { useRef, useEffect, useCallback } from 'react'
import { createContext, useContextSelector } from 'use-context-selector'
import savePatchBatch from '@databyss-org/data/pouchdb/pages/lib/savePatchBatch'
import { setPublicPage } from '@databyss-org/data/pouchdb/groups'
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
} from '../interfaces'
import { PageReplicator } from './PageReplicator'

import * as actions from './actions'

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
  getPage: (id: string) => Page | ResourcePending | null
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
  patchQueueSize: number
  removePageFromCache: (id: string) => void
}
const useReducer = createReducer()
export const EditorPageContext = createContext<ContextType>(null!)

export const EditorPageProvider: React.FunctionComponent<PropsType> = ({
  children,
  initialState = _initState,
}: PropsType) => {
  const refDictRef = useRef<RefDict>({})
  const pageCachedHookRef: React.Ref<PageHookDict> = useRef({})
  const { id: pageId } = useParams()

  const [state, dispatch] = useReducer(reducer, initialState)

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

  const patchQueueSize = state.patchQueueSize

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
    (id: string): ResourceResponse<Page> => {
      if (state.cache[id]) {
        return state.cache[id]
      }
      dispatch(actions.fetchPage(id))
      return null
    },
    [JSON.stringify(state.cache)]
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

  const setPatches = useCallback((patches: PatchBatch) => {
    if (patches) {
      savePatchBatch(patches)
    }
  }, [])

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
        patchQueueSize,
        removePageFromCache,
        getPublicAccount,
      }}
    >
      <PageReplicator pageId={pageId}>{children}</PageReplicator>
    </EditorPageContext.Provider>
  )
}

export const useEditorPageContext = (selector = (x: ContextType) => x) =>
  useContextSelector(EditorPageContext, selector)
