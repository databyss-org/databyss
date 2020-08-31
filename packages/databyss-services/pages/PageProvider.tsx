import React, { useRef, useEffect, useCallback } from 'react'
import { createContext, useContextSelector } from 'use-context-selector'
import createReducer from '../lib/createReducer'
import reducer, { initialState } from './reducer'
import { ResourcePending } from '../interfaces/ResourcePending'
import {
  Page,
  PageState,
  RefDict,
  PageHeader,
  PatchBatch,
  ResourceResponse,
} from '../interfaces'

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
  setPageHeader: (page: Page) => void
  getPages: () => void
  getPage: (id: string) => Page | ResourcePending | null
  clearBlockDict: () => void
  setPatches: (patches: PatchBatch) => void
  registerBlockRefByIndex: (
    index: number,
    refOne: React.Ref<HTMLInputElement>
  ) => void
  getBlockRefByIndex: (index: number) => React.Ref<HTMLInputElement>
}

const useReducer = createReducer()
export const PageContext = createContext<ContextType | null>(null)

const PageProvider: React.FunctionComponent<PropsType> = ({
  children,
  initialState,
}: PropsType) => {
  const refDictRef = useRef<RefDict>({})
  const pageCachedHookRef: React.Ref<PageHookDict> = useRef({})

  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(
    () => {
      Object.keys(pageCachedHookRef.current).forEach(k => {
        if (state.cache[k]) {
          // execute callback
          pageCachedHookRef.current[k]()
          // remove from queue
          delete pageCachedHookRef.current[k]
        }
      })
    },
    [state.cache]
  )

  const hasPendingPatches = state.patchQueueSize

  const onPageCached = (id: string, callback: Function) => {
    // add back to dictionary
    pageCachedHookRef.current[id] = callback
  }

  const setPage = useCallback(
    (page: Page): Promise<void> =>
      new Promise(res => {
        onPageCached(page._id, res)
        dispatch(actions.savePage(page))
      }),
    []
  )

  const setPageHeader = useCallback((page: PageHeader) => {
    dispatch(actions.savePageHeader(page))
  }, [])

  const getPages = useCallback(
    (): ResourceResponse<PageHeader> => {
      if (state.headerCache) {
        return state.headerCache
      }

      if (!(state.headerCache instanceof ResourcePending)) {
        dispatch(actions.fetchPageHeaders())
      }

      return null
    },
    [state.headerCache]
  )

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

  const removePage = (id: string) => {
    dispatch(actions.deletePage(id))
  }

  const archivePage = useCallback(
    (id: string): Promise<void> =>
      new Promise(res => {
        dispatch(actions.onArchivePage(id, state.cache[id], res))
      }),
    [state.cache]
  )

  const setDefaultPage = useCallback((id: string) => {
    dispatch(actions.onSetDefaultPage(id))
  }, [])

  const setPatches = useCallback((patches: PatchBatch) => {
    dispatch(actions.savePatchBatch(patches))
  }, [])

  const removePageFromCache = (id: string) => {
    dispatch(actions.removePageFromCache(id))
  }

  const setPagePublic = (id: string, bool: boolean, accountId: string) => {
    dispatch(actions.setPagePublic(id, bool, accountId))
  }

  return (
    <PageContext.Provider
      value={{
        getPages,
        getPage,
        setPage,
        setPageHeader,
        setPatches,
        registerBlockRefByIndex,
        getBlockRefByIndex,
        clearBlockDict,
        removePage,
        archivePage,
        setDefaultPage,
        onPageCached,
        setPagePublic,
        hasPendingPatches,
        removePageFromCache,
      }}
    >
      {children}
    </PageContext.Provider>
  )
}

export const usePageContext = (selector = x => x) =>
  useContextSelector(PageContext, selector)

PageProvider.defaultProps = {
  initialState,
}

export default PageProvider
