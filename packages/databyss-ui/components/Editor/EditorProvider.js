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

const makeComposedReducer = contentEditableReducer => (state, action) => ({
  ...reducer(state, action),
  editableState: contentEditableReducer(
    action.payload.editableState || state.editableState,
    action
  ),
})

const DraftEditorProvider = ({ children, initialState, editableReducer }) => {
  const [state, dispatch] = useThunkReducer(
    makeComposedReducer(editableReducer),
    initialState
  )

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
