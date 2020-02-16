import React, { createContext, useContext } from 'react'
import createReducer from '@databyss-org/services/lib/createReducer'

export { default as pageReducer } from './state/page/reducer'
export { default as lineReducer } from './state/line/reducer'

const useReducer = createReducer()

export const EditorContext = createContext()

export const makeComposedReducer = (reducer, editableReducer) => (
  state,
  action
) => ({
  ...reducer(state, action),
  editableState: editableReducer(
    {
      ...(action.payload.editableState || state.editableState),
      blocks: state.blocks,
    },
    action
  ),
})

const EditorProvider = ({
  children,
  initialState,
  editableReducer,
  name,
  reducer,
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
