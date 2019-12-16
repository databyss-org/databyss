import React, { createContext, useContext } from 'react'
import createReducer from '@databyss-org/services/lib/createReducer'

const useReducer = createReducer()

export const EditorContext = createContext()

export const makeComposedReducer = (reducer, editableReducer) => (
  state,
  action
) => ({
  ...reducer(state, action),
  editableState: editableReducer(
    action.payload.editableState || state.editableState,
    action
  ),
})

const EditorProvider = ({
  children,
  initialState,
  reducer,
  editableReducer,
  name,
}) => {
  const [state, dispatch, stateRef] = useReducer(
    makeComposedReducer(reducer, editableReducer),
    initialState,
    { name: `EditorProvider ${name ? `(${name})` : ''}` }
  )

  return (
    <EditorContext.Provider value={[state, dispatch, stateRef]}>
      {children}
    </EditorContext.Provider>
  )
}

export const useEditorContext = () => useContext(EditorContext)

export default EditorProvider
