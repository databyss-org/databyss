import React, { createContext, useContext } from 'react'
import ErrorFallback from '@databyss-org/ui/components/Notify/ErrorFallback'
import Loading from '@databyss-org/ui/components/Notify/LoadingFallback'
import createReducer from '../lib/createReducer'
import reducer, { initialState } from './reducer'

import { fetchPages, fetchPage } from './actions'

const useReducer = createReducer()

export const PageContext = createContext()

const PageProvider = ({ children, initialState }) => {
  const [state, dispatch, stateRef] = useReducer(reducer, initialState)

  const getPages = () => {
    if (state.headerCache) {
      return state.headerCache
    }
    if (!state.isLoading) {
      dispatch(fetchPages())
    }
    return null
  }

  const getPage = id => {
    if (state.cache[id]) {
      return state.cache[id]
    }
    if (!state.isLoading) {
      dispatch(fetchPage(id))
    }
    return null
  }

  return (
    <PageContext.Provider
      value={{ state, dispatch, stateRef, getPages, getPage }}
    >
      {children}
    </PageContext.Provider>
  )
}

export const usePageContext = () => useContext(PageContext)

PageProvider.defaultProps = {
  initialState,
}

export const PagesLoader = ({ children }) => {
  const { getPages } = usePageContext()
  const pages = getPages()

  if (pages instanceof Error) {
    return <ErrorFallback error={pages} />
  }

  if (typeof children !== 'function') {
    throw new Error('Child must be a function')
  }

  return pages ? children(pages) : <Loading />
}

export const withPages = Wrapped => ({ ...others }) => (
  <PagesLoader>{pages => <Wrapped pages={pages} {...others} />}</PagesLoader>
)

export const PageLoader = ({ pageId, children }) => {
  const { getPage } = usePageContext()
  const page = getPage(pageId)
  if (page instanceof Error) {
    return <ErrorFallback error={page} />
  }

  if (typeof children !== 'function') {
    throw new Error('Child must be a function')
  }
  // return <Loading />
  return page ? children(page) : <Loading />
}

export const withPage = Wrapped => ({ pageId, ...others }) => (
  <PageLoader pageId={pageId}>
    {page => <Wrapped page={page} {...others} />}
  </PageLoader>
)

export default PageProvider
