import React, { createContext, useContext } from 'react'
import ErrorFallback from '@databyss-org/ui/components/Notify/ErrorFallback'
import Loading from '@databyss-org/ui/components/Notify/LoadingFallback'
import createReducer from '../lib/createReducer'
import reducer, { initialState } from './reducer'

import { getPages } from './actions'

const useReducer = createReducer()

export const PageContext = createContext()

const PageProvider = ({ children, initialState }) => {
  const [state, dispatch, stateRef] = useReducer(reducer, initialState)

  const fetchPages = () => {
    if (state.pages) {
      return state.pages
    }
    if (!state.isPagesLoading) {
      dispatch(getPages())
    }
    return null
  }

  return (
    <PageContext.Provider value={[state, dispatch, stateRef, fetchPages]}>
      {children}
    </PageContext.Provider>
  )
}

export const usePageContext = () => useContext(PageContext)

PageProvider.defaultProps = {
  initialState,
}

export const withPages = Wrapped => ({ ...others }) => {
  const [, , , fetchPages] = usePageContext()
  const pages = fetchPages()
  if (pages instanceof Error) {
    return <ErrorFallback error={pages} />
  }

  return pages ? <Wrapped pages={pages} {...others} /> : <Loading />
}

export default PageProvider
