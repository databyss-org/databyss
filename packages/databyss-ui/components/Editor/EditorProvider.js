import React, { createContext, useContext } from 'react'
import { createReducer } from 'react-use'
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'
import reducer, { initialState } from './state/reducer'

const logger = createLogger({
  collapsed: true,
})

const useThunkReducer = createReducer(thunk, logger)

export const EditorContext = createContext()

const EditorProvider = ({ children, initialState }) => {
  const [state, dispatch] = useThunkReducer(reducer, initialState)

  return (
    <EditorContext.Provider value={[state, dispatch]}>
      {children}
    </EditorContext.Provider>
  )
}

export const useEditorContext = () => useContext(EditorContext)

EditorProvider.defaultProps = {
  initialState,
}

export default EditorProvider
