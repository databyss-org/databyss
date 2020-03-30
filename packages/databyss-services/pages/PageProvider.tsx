import React, { createContext, useContext, useEffect } from 'react'
import createReducer from '../lib/createReducer'
import reducer, { initialState } from './reducer'
import { ResourcePending } from '../lib/ResourcePending'
import Page from './Page'

import { fetchPageHeaders, fetchPage, savePage, registerRef } from './actions'

interface PropsType {
  children: JSX.Element
  initialState: any
}

interface ContextType {
  setPage: (page: Page) => void
  getPages: () => void
  getPage: (id: string) => Page | ResourcePending | null
  registerBlockRef: (id: string, refOne: React.Ref<HTMLInputElement>) => void
}

const useReducer = createReducer()
export const PageContext = createContext<ContextType | null>(null)

const PageProvider: React.FunctionComponent<PropsType> = ({
  children,
  initialState,
}: PropsType) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const setPage = (page: Page): void => {
    // window.requestAnimationFrame(() => dispatch(savePage(page)))
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

  const refreshPages = () => {
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
    dispatch(registerRef(id, ref))
    return null
  }

  const getBlockRef = (id: string) => {
    if (state.refDict[id]) {
      return state.refDict[id]
    }
    return null
    //   console.log(state.refDict)
  }

  return (
    <PageContext.Provider
      value={{
        getPages,
        getPage,
        setPage,
        registerBlockRef,
        getBlockRef,
        refreshPages,
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
