import React, { createContext, useContext, useRef } from 'react'
import createReducer from '../lib/createReducer'
import reducer, { initialState } from './reducer'
import { ResourcePending } from '../lib/ResourcePending'
import Page from './Page'

import {
  fetchPageHeaders,
  fetchPage,
  savePage,
  savePatch,
  deletePage,
  onArchivePage,
  onSetDefaultPage,
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
  patches: Array<Operation>
}

interface RefDict {
  [key: string]: React.Ref<HTMLInputElement>
}

interface ContextType {
  setPage: (page: Page) => void
  getPages: () => void
  getPage: (id: string) => Page | ResourcePending | null
  clearBlockDict: () => void
  setPatch: (patch: PatchType) => void
  registerBlockRef: (id: string, refOne: React.Ref<HTMLInputElement>) => void
  getBlockRefByIndex: (id: string) => React.Ref<HTMLInputElement>
}

const useReducer = createReducer()
export const PageContext = createContext<ContextType | null>(null)

const PageProvider: React.FunctionComponent<PropsType> = ({
  children,
  initialState,
}: PropsType) => {
  const refDictRef = useRef<RefDict>({})
  const [state, dispatch] = useReducer(reducer, initialState)

  const setPage = (page: Page): void => {
    // window.requestAnimationFrame(() => dispatch(savePage(page)))
    console.log(page)
    dispatch(savePage(page))
  }

  const getPages = () => {
    if (state.headerCache) {
      return state.headerCache
    }

    if (!(state.headerCache instanceof ResourcePending)) {
      dispatch(fetchPageHeaders())
    }

    return null
  }

  const getPage = (id: string): Page | ResourcePending | null => {
    if (state.cache[id]) {
      return state.cache[id]
    }
    if (!(state.cache[id] instanceof ResourcePending)) {
      dispatch(fetchPage(id))
    }
    return null
  }

  const registerBlockRef = (id: string, ref: React.Ref<HTMLInputElement>) => {
    refDictRef.current[id] = ref
  }

  const getBlockRefByIndex = (id: string) => {
    if (refDictRef.current[id]) {
      return refDictRef.current[id]
    }
    return null
  }

  const clearBlockDict = () => {
    refDictRef.current = {}
  }

  const removePage = (id: string) => {
    dispatch(deletePage(id))
  }

  const archivePage = (id: string) => {
    dispatch(onArchivePage(id, state.cache[id]))
  }

  const setDefaultPage = (id: string) => {
    dispatch(onSetDefaultPage(id))
  }

  const setPatch = (patch: PatchType) => {
    dispatch(savePatch(patch))
  }

  return (
    <PageContext.Provider
      value={{
        getPages,
        getPage,
        setPage,
        setPatch,
        registerBlockRef,
        getBlockRefByIndex,
        clearBlockDict,
        removePage,
        archivePage,
        setDefaultPage,
      }}
    >
      {children}
    </PageContext.Provider>
  )
}

export const usePageContext = () => useContext(PageContext)

PageProvider.defaultProps = {
  initialState,
}

export default PageProvider
