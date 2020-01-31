import React, { createContext, useContext } from 'react'
import ErrorFallback from '@databyss-org/ui/components/Notify/ErrorFallback'
import Loading from '@databyss-org/ui/components/Notify/LoadingFallback'
import createReducer from '../lib/createReducer'
import reducer, { initialState } from './reducer'
import { ResourcePending } from './../lib/ResourcePending'

import { fetchPageHeaders, fetchPage, savePage } from './actions'

const useReducer = createReducer()

export const PageContext = createContext()

const PageProvider = ({ children, initialState }) => {
  const [state, dispatch, stateRef] = useReducer(reducer, initialState)

  const setPage = page => {
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

  const getPage = id => {
    if (state.cache[id]) {
      return state.cache[id]
    }
    if (!(state.cache[id] instanceof ResourcePending)) {
      dispatch(fetchPage(id))
    }
    return null
  }

  return (
    <PageContext.Provider
      value={{ state, dispatch, stateRef, getPages, getPage, setPage }}
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

  if (!pages || pages instanceof ResourcePending) {
    return <Loading />
  }

  if (typeof children !== 'function') {
    throw new Error('Child must be a function')
  }

  return children(pages)
}

export const withPages = Wrapped => ({ ...others }) => (
  <PagesLoader>{pages => <Wrapped pages={pages} {...others} />}</PagesLoader>
)

export const PageLoader = ({ pageId, children }) => {
  const { getPage } = usePageContext()
  const page = getPage(pageId)

  if (!page || page instanceof ResourcePending) {
    return <Loading />
  }

  if (page instanceof Error) {
    return <ErrorFallback error={page} />
  }

  if (typeof children !== 'function') {
    throw new Error('Child must be a function')
  }

  return children(page)
}

export const withPage = Wrapped => ({ pageId, ...others }) => (
  <PageLoader pageId={pageId}>
    {page => <Wrapped page={page} {...others} />}
  </PageLoader>
)

export default PageProvider
