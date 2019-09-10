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

export default PageProvider
