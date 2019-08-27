import React, { createContext, useContext } from 'react'
import { createReducer } from 'react-use'
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'
import reducer, { initialState } from './state/reducer'
import draftReducer from './state/draftReducer'

const logger = createLogger({
  collapsed: true,
})

const useThunkReducer = createReducer(thunk, logger)

export const EditorContext = createContext()

const composedReducer = (state, action) => ({
  ...reducer(state, action),
  draftState: draftReducer(
    action.payload.draftState || state.draftState,
    action
  ),
})

const DraftEditorProvider = ({ children, initialState }) => {
  const [state, dispatch] = useThunkReducer(composedReducer, initialState)

  return (
    <EditorContext.Provider value={[state, dispatch]}>
      {children}
    </EditorContext.Provider>
  )
}

export const useEditorContext = () => useContext(EditorContext)

DraftEditorProvider.defaultProps = {
  initialState,
}

export default DraftEditorProvider
