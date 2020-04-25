import React, { createContext, useContext, useEffect } from 'react'
import createReducer from '@databyss-org/services/lib/createReducer'
import {
  SET_SELECTION,
  SPLIT,
  MERGE,
  SET_CONTENT,
  REMOVE,
  CLEAR,
  DEQUEUE_NEW_ENTITY,
} from './constants'
import { Text, Selection, Entity } from '../interfaces'
import * as util from '../lib/util'
import initialState from './initialState'
import reducer from './reducer'

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
  getEntityAtIndex: (index: number) => Entity
  remove: (index: number) => void
  clear: (index: number) => void
}

type PropsType = {
  children: JSX.Element
  initialState: any
  onChange: Function
}

const useReducer = createReducer()

export const EditorContext = createContext<ContextType | null>(null)

const EditorProvider: React.FunctionComponent<PropsType> = ({
  children,
  initialState,
  onChange,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

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
   * Get the Entity at `index`
   */
  const getEntityAtIndex = (index: number): Entity =>
    util.getEntityAtIndex(state, index)

  /**
   * Remove the block at `index`
   */
  const remove = (index: number): void =>
    dispatch({
      type: REMOVE,
      payload: { index },
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

  useEffect(
    () => {
      onChange(state)
    },
    [state]
  )

  return (
    <EditorContext.Provider
      value={{
        state,
        setSelection,
        setContent,
        split,
        merge,
        getEntityAtIndex,
        remove,
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
