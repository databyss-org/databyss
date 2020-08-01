import React, { createContext, useContext } from 'react'
import ReactDOMServer from 'react-dom/server'
import { Patch } from 'immer'
import createReducer from '@databyss-org/services/lib/createReducer'
import {
  SET_SELECTION,
  SPLIT,
  MERGE,
  SET_CONTENT,
  REMOVE,
  CLEAR,
  DEQUEUE_NEW_ENTITY,
  COPY,
  CUT,
  PASTE,
  REMOVE_AT_SELECTION,
} from './constants'
import { Text, Selection, EditorState } from '../interfaces'
import initialState from './initialState'
import reducer from './reducer'
import {
  cutOrCopyEventHandler,
  pasteEventHandler,
  getFragmentAtSelection,
} from '../lib/clipboardUtils'

export type Transform = {
  // current selection
  selection: Selection
  // row index
  index: number
  // text to modify at `block[index]`
  text?: Text
  // text to modify at `block[index - 1]`
  previous?: Text
  // number of blocks added or removed
  blockDelta?: number
  isRefEntity?: boolean
}

export type TransformArray = {
  selection: Selection
  operations: [Transform]
}

type ContextType = {
  state: any
  split: (transform: Transform) => void
  merge: (transform: Transform) => void
  setContent: (transform: Transform) => void
  setSelection: (selection: Selection) => void
  remove: (index: number) => void
  removeAtSelection: () => void
  clear: (index: number) => void
  copy: (event: ClipboardEvent) => void
  cut: (event: ClipboardEvent) => void
  paste: (event: ClipboardEvent) => void
}

export type OnChangeArgs = {
  nextState: EditorState
  previousState: EditorState
  patches: Patch[]
  inversePatches: Patch[]
}

type PropsType = {
  children: JSX.Element
  initialState: EditorState
  onChange: (args: OnChangeArgs) => void
}

const useReducer = createReducer()

export const EditorContext = createContext<ContextType | null>(null)

const EditorProvider: React.FunctionComponent<PropsType> = ({
  children,
  initialState,
  onChange,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState, {
    initializer: null,
    name: 'EditorProvider',
    onChange,
  })

  const setSelection = (selection: Selection) =>
    dispatch({
      type: SET_SELECTION,
      payload: { selection },
    })

  /**
   * Split the block at `index` into two blocks
   * Text in `previous` becomes new text in block at `index`
   * Text in `text` becomes new text in block after `index`
   */
  const split = (transform: Transform): void =>
    dispatch({
      type: SPLIT,
      payload: transform,
    })

  /**
   * Merge content into the block at `index`
   * Expects `text` to be the merged content
   */
  const merge = (transform: Transform): void =>
    dispatch({
      type: MERGE,
      payload: transform,
    })

  /**
   * Set block content at `index` to `text`
   */
  const setContent = (transformArray: TransformArray): void =>
    dispatch({
      type: SET_CONTENT,
      payload: transformArray,
    })

  /**
   * Remove the block at `index`
   */
  const remove = (index: number): void =>
    dispatch({
      type: REMOVE,
      payload: { index },
    })

  /**
   * Remove text currently selected. May span multiple blocks
   */
  const removeAtSelection = (): void =>
    dispatch({
      type: REMOVE_AT_SELECTION,
    })

  /**
   * Clear the block at `index`
   * resets the type to `ENTRY`
   */
  const clear = (index: number): void =>
    dispatch({
      type: CLEAR,
      payload: { index },
    })

  const removeEntityFromQueue = (id: number): void =>
    dispatch({
      type: DEQUEUE_NEW_ENTITY,
      payload: { id },
    })

  const cut = (e: ClipboardEvent) => {
    const _frag = getFragmentAtSelection(state)
    cutOrCopyEventHandler(e, _frag)

    dispatch({
      type: CUT,
    })
  }

  const copy = (e: ClipboardEvent) => {
    const _frag = getFragmentAtSelection(state)
    cutOrCopyEventHandler(e, _frag)

    dispatch({
      type: COPY,
    })
  }

  const paste = (e: ClipboardEvent) => {
    const data = pasteEventHandler(e)
    if (data) {
      dispatch({
        type: PASTE,
        payload: {
          data,
        },
      })
    }
  }

  return (
    <EditorContext.Provider
      value={{
        state,
        copy,
        cut,
        paste,
        setSelection,
        setContent,
        split,
        merge,
        remove,
        removeAtSelection,
        clear,
        removeEntityFromQueue,
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}

export const useEditorContext = () => useContext(EditorContext)

EditorProvider.defaultProps = {
  onChange: () => null,
  initialState,
}

export default EditorProvider
