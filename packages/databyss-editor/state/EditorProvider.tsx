import React, {
  createContext,
  useContext,
  forwardRef,
  useImperativeHandle,
  useRef,
  useMemo,
} from 'react'
import createReducer from '@databyss-org/services/lib/createReducer'
// import { setBlockRelations } from '@databyss-org/services/entries'
import { Patch } from 'immer'
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
  UNDO,
  REDO,
  REMOVE_AT_SELECTION,
  CACHE_ENTITY_SUGGESTIONS,
  DEQUEUE_REMOVED_ENTITY,
} from './constants'
import {
  Text,
  Selection,
  EditorState,
  Block,
  PagePath,
  // BlockRelationPayload,
} from '../interfaces'
import _initState, { addMetaDataToBlocks } from './initialState'
import reducer from './reducer'
import {
  getPagePath,
  //  indexPage
} from '../lib/util'

import {
  cutOrCopyEventHandler,
  pasteEventHandler,
  getFragmentAtSelection,
  isSelectionCollapsed,
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
  isRefEntity?: string
}

export type TransformArray = {
  selection: Selection
  operations: [Transform]
}

type ContextType = {
  state: any
  split: (transform: Transform) => void
  merge: (transform: Transform) => void
  setContent: (transformArray: TransformArray) => void
  setSelection: (selection: Selection) => void
  remove: (index: number) => void
  removeAtSelection: () => void
  removeAtomicFromQueue: (id: string) => void
  removeEntityFromQueue: (id: string) => void
  clear: (index: number) => void
  copy: (event: ClipboardEvent) => void
  cut: (event: ClipboardEvent) => void
  paste: (event: ClipboardEvent) => void
  insert: (blocks: Block[]) => void
  replace: (blocks: Block[]) => void
  cacheEntitySuggestions: (blocks: Block[]) => void
  // setInlineBlockRelations: (callback: Function) => void
}

export type OnChangeArgs = {
  nextState: EditorState
  previousState: EditorState
  patches: Patch[]
  inversePatches: Patch[]
  type: string
  clearBlockRelations: boolean
}

export interface EditorHandles {
  undo: (patches: Patch[]) => void
  redo: (patches: Patch[]) => void
  pagePath: PagePath
}

type PropsType = {
  //  ref?: React.RefObject<EditorHandles>
  // children: JSX.Element
  initialState: EditorState
  onChange?: (args: OnChangeArgs) => void
}

const useReducer = createReducer()

export const EditorContext = createContext<ContextType>(null!)

const EditorProvider: React.RefForwardingComponent<EditorHandles, PropsType> = (
  { children, initialState = _initState, onChange },
  ref
) => {
  // get the current page header

  const pagePathRef = useRef<PagePath>({ path: [], blockRelations: [] })

  /*
    intercepts onChange props and runs the block relations algorithm, dispatches block relations
    */

  const forkOnChange = (props: OnChangeArgs) => {
    pagePathRef.current = getPagePath(props.nextState)
    if (onChange) {
      onChange(props)
    }
  }

  const [state, dispatch] = useReducer(
    reducer,
    addMetaDataToBlocks(initialState),
    {
      initializer: null,
      name: 'EditorProvider',
      onChange: forkOnChange,
    }
  )

  useImperativeHandle(
    ref,
    () => ({
      undo: (patches: Patch[]) => {
        dispatch({
          type: UNDO,
          payload: { patches },
        })
      },
      redo: (patches: Patch[]) => {
        dispatch({
          type: REDO,
          payload: { patches },
        })
      },
      pagePath: pagePathRef.current,
    }),
    [pagePathRef.current]
  )

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
  const split = (transform: Transform): void => {
    dispatch({
      type: SPLIT,
      payload: transform,
    })
  }
  /**
   * Merge content into the block at `index`
   * Expects `text` to be the merged content
   */
  const merge = (transform: Transform): void => {
    dispatch({
      type: MERGE,
      payload: transform,
    })
  }
  /**
   * Set block content at `index` to `text`
   */
  const setContent = (transformArray: TransformArray): void => {
    // recalculate block relations
    // onBlockRelationsChange(pagePathRef.current.blockRelations)
    dispatch({
      type: SET_CONTENT,
      payload: transformArray,
    })
  }

  /**
   * Remove the block at `index`
   */
  const remove = (index: number): void => {
    dispatch({
      type: REMOVE,
      payload: { index },
    })
  }

  /**
   * Remove text currently selected. May span multiple blocks
   */
  const removeAtSelection = (): void => {
    dispatch({
      type: REMOVE_AT_SELECTION,
    })
  }

  /**
   * Clear the block at `index`
   * resets the type to `ENTRY`
   */
  const clear = (index: number) =>
    dispatch({
      type: CLEAR,
      payload: { index },
    })

  const removeEntityFromQueue = (id: string) =>
    dispatch({
      type: DEQUEUE_NEW_ENTITY,
      payload: { id },
    })

  const removeAtomicFromQueue = (id: string) =>
    dispatch({
      type: DEQUEUE_REMOVED_ENTITY,
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

  /**
   * Insert one or more blocks at the current selection.
   * If inserting multiple blocks and current selection has text,
   * blocks are inserted below the current selection block.
   * */
  const insert = (blocks: Block[]) => {
    dispatch({
      type: PASTE,
      payload: {
        data: blocks,
      },
    })
  }

  /**
   * Replace current selection block with one or more blocks
   * */
  const replace = (blocks: Block[]) => {
    dispatch({
      type: PASTE,
      payload: {
        data: blocks,
        replace: true,
      },
    })
  }

  const paste = (e: ClipboardEvent) => {
    // if text is highlighted, remove current selection before paste
    if (!isSelectionCollapsed(state.selection)) {
      removeAtSelection()
    }
    const data = pasteEventHandler(e)
    if (data) {
      insert(data)
    }
  }

  const cacheEntitySuggestions = (blocks: Block[]) => {
    dispatch({
      type: CACHE_ENTITY_SUGGESTIONS,
      payload: { blocks },
    })
  }

  return useMemo(
    () => (
      <EditorContext.Provider
        value={{
          state,
          copy,
          cut,
          insert,
          replace,
          paste,
          setSelection,
          setContent,
          split,
          merge,
          remove,
          removeAtSelection,
          clear,
          removeEntityFromQueue,
          cacheEntitySuggestions,
          removeAtomicFromQueue,
          // setInlineBlockRelations,
        }}
      >
        {children}
      </EditorContext.Provider>
    ),
    [state]
  )
}

export const useEditorContext = () => useContext(EditorContext)

export default forwardRef(EditorProvider)
