import React, { useRef, useEffect, useCallback } from 'react'
import { createContext, useContextSelector } from 'use-context-selector'
import createReducer from '../lib/createReducer'
import reducer, { initialState } from './reducer'
import { ResourcePending } from '../lib/ResourcePending'
import Page from './Page'

import {
  fetchPageHeaders,
  fetchPage,
  savePage,
  savePageHeader,
  savePatch,
  deletePage,
  onArchivePage,
  onSetDefaultPage,
  removePageIdFromCache,
} from './actions'

interface PropsType {
  children: JSX.Element
  initialState: any
}

interface Operation {
  op: string
  path: any
  value: any
}

interface PatchType {
  _id: string
  operations: Array<Operation>
}

interface RefDict {
  [key: string]: React.Ref<HTMLInputElement>
}

interface PageHookDict {
  [key: string]: Function
}

interface ContextType {
  setPage: (page: Page) => void
  setPageHeader: (page: Page) => void
  getPages: () => void
  getPage: (id: string) => Page | ResourcePending | null
  clearBlockDict: () => void
  setPatch: (patch: PatchType) => void
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
        onPageCached(page.page._id, res)
        dispatch(savePage(page))
      }),
    []
  )

  const setPageHeader = useCallback((page: Page) => {
    dispatch(savePageHeader(page))
  }, [])

  const getPages = useCallback(
    () => {
      if (state.headerCache) {
        return state.headerCache
      }

      if (!(state.headerCache instanceof ResourcePending)) {
        dispatch(fetchPageHeaders())
      }

      return null
    },
    [state.headerCache]
  )

  const getPage = useCallback(
    (id: string): Page | ResourcePending | null => {
      if (state.cache[id]) {
        return state.cache[id]
      }
      if (!(state.cache[id] instanceof ResourcePending)) {
        dispatch(fetchPage(id))
      }
      return null
    },
    [state.cache]
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
    dispatch(deletePage(id))
  }

  const archivePage = useCallback(
    (id: string) => {
      dispatch(onArchivePage(id, state.cache[id]))
    },
    [state.cache]
  )

  const setDefaultPage = useCallback((id: string) => {
    dispatch(onSetDefaultPage(id))
  }, [])

  const setPatch = useCallback((patch: PatchType) => {
    dispatch(savePatch(patch))
  }, [])

  const removePageFromCache = (id: string) => {
    dispatch(removePageIdFromCache(id))
  }

  return (
    <PageContext.Provider
      value={{
        getPages,
        getPage,
        setPage,
        setPageHeader,
        setPatch,
        registerBlockRefByIndex,
        getBlockRefByIndex,
        clearBlockDict,
        removePage,
        archivePage,
        setDefaultPage,
        onPageCached,
        hasPendingPatches,
        removePageFromCache,
      }}
    >
      {children}
    </PageContext.Provider>
  )
}

export const usePageContext = (selector = x => x) =>
  PageContext && useContextSelector(PageContext, selector)

PageProvider.defaultProps = {
  initialState,
}

export default PageProvider
