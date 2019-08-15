import React, { createContext, useContext } from 'react'
import { createReducer } from 'react-use'
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'

const logger = createLogger({
  collapsed: true,
})
const useThunkReducer = createReducer(thunk, logger)

export const ServiceContext = createContext()

const EditorProvider = ({ reducer, initialState, children }) => {
  const [state, dispatch] = useThunkReducer(reducer, initialState)

  return (
    <ServiceContext.Provider value={[state, dispatch]}>
      {children}
    </ServiceContext.Provider>
  )
}

export const useProviderContext = () => useContext(ServiceContext)

export const withEditorContext = Wrapped => props => (
  <ServiceContext.Consumer>
    {context => {
      if (!context) {
        console.warn('Component is not wrapped in an EditorProvider.')
        return <Wrapped {...props} />
      }
      return <Wrapped editorContext={context} {...props} />
    }}
  </ServiceContext.Consumer>
)

export default EditorProvider
