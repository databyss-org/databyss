import React, { createContext, useContext } from 'react'
import { createReducer } from 'react-use'
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'
import reducer, { initialState } from './reducer'

const logger = createLogger({
  collapsed: true,
})

const useThunkReducer = createReducer(thunk, logger)

export const PageContext = createContext()

const PageProvider = ({ children, initialState }) => {
  const [state, dispatch] = useThunkReducer(reducer, initialState)

  return (
    <PageContext.Provider value={[state, dispatch]}>
      {children}
    </PageContext.Provider>
  )
}

export const usePageContext = () => useContext(PageContext)

PageProvider.defaultProps = {
  initialState,
}

export default PageProvider
