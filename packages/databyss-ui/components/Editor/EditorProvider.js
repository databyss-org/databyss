import React, { createContext, useContext } from 'react'
import createReducer from '@databyss-org/services/lib/createReducer'
import reducer, { initialState } from './state/reducer'

const useReducer = createReducer()

export const EditorContext = createContext()

const makeComposedReducer = contentEditableReducer => (state, action) => ({
  ...reducer(state, action),
  editableState: contentEditableReducer(
    action.payload.editableState || state.editableState,
    action
  ),
})

const EditorProvider = ({ children, initialState, editableReducer }) => {
  const [state, dispatch, stateRef] = useReducer(
    makeComposedReducer(editableReducer),
    initialState
  )

  return (
    <EditorContext.Provider value={[state, dispatch, stateRef]}>
      {children}
    </EditorContext.Provider>
  )
}

export const useEditorContext = () => useContext(EditorContext)

EditorProvider.defaultProps = {
  initialState,
}

export default EditorProvider
