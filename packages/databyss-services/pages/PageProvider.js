import React, { createContext, useContext } from 'react'
import createReducer from '../lib/createReducer'
import reducer, { initialState } from './reducer'

const useReducer = createReducer()

export const PageContext = createContext()

const PageProvider = ({ children, initialState }) => {
  const [state, dispatch, stateRef] = useReducer(reducer, initialState)

  return (
    <PageContext.Provider value={[state, dispatch, stateRef]}>
      {children}
    </PageContext.Provider>
  )
}

export const usePageContext = () => useContext(PageContext)

PageProvider.defaultProps = {
  initialState,
}

export const withPages = Wrapped => ({ sourceId, ...others }) => {
  const { getSource } = useSourceContext()
  const source = getSource(sourceId)

  if (source instanceof Error) {
    return <ErrorFallback error={source} />
  }

  return source ? <Wrapped source={source} {...others} /> : <Loading />
}

export default PageProvider
