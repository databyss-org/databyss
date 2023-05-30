import React, {
  createContext,
  useContext,
  forwardRef,
  useImperativeHandle,
  useRef,
  useMemo,
  Ref,
} from 'react'
import createReducer from '@databyss-org/services/lib/createReducer'
import { Patch } from 'immer'
import { useEditorPageContext } from '@databyss-org/services/editorPage/EditorPageProvider'
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
  PASTE_EMBED,
} from './constants'
import { Text, Selection, EditorState, Block, PagePath } from '../interfaces'
import _initState, { addMetaDataToBlocks } from './initialState'
import reducer from './reducer'
import { getPagePath } from '../lib/util'
import { BlockType } from '../../databyss-services/interfaces/Block'

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
  isRefEntity?: { _id: string; type: BlockType }
}

export type TransformArray = {
  selection: Selection
  operations: [Transform]
}

export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/gif', 'image/png']

type ContextType = {
  state: EditorState
  stateRef: Ref<EditorState>
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
  embedPaste: ({ event: ClipboardEvent, inlineType: string }) => void
  paste: (event: ClipboardEvent) => void
  insert: (blocks: Block[]) => void
  replace: (blocks: Block[]) => void
  cacheEntitySuggestions: (blocks: Block[]) => void
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
  const selectionLastUpdatedAtRef = useRef<number>(Date.now())
  const embedFile = useEditorPageContext((c) => c.embedFile)

  /*
    intercepts onChange props and runs the block relations algorithm, dispatches block relations
    */

  const forkOnChange = (props: OnChangeArgs) => {
    pagePathRef.current = getPagePath(props.nextState)
    if (onChange) {
      onChange(props)
    }
  }

  const [state, dispatch, stateRef] = useReducer(
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

  const setSelection = (selection: Selection) => {
    selectionLastUpdatedAtRef.current = Date.now()
    if (!selection._id) {
      selection._id = state.selection?._id
    }
    dispatch({
      type: SET_SELECTION,
      payload: { selection },
    })
  }

  /**
   * paste event handler
   */

  const embedPaste = ({ event: e, inlineType }) => {
    const htmlSrc = e.clipboardData!.getData('text/html')
    if (htmlSrc) {
      // if hmtl is pasted, attempt to retrieve the src tag from images
      const doc = new DOMParser().parseFromString(htmlSrc, 'text/html')
      const _el = doc.getElementsByTagName('img')
      if (_el.length) {
        // assume first element in array
        const _src = _el[0].src
        if (_src) {
          dispatch({
            type: PASTE_EMBED,
            payload: { data: _src, inlineType },
          })
        }
      }
    }
    // plaintext text fragment
    const plainTextDataTransfer = e.clipboardData!.getData('text/plain')

    dispatch({
      type: PASTE_EMBED,
      payload: { data: plainTextDataTransfer, inlineType },
    })
  }

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
    selectionLastUpdatedAtRef.current = Date.now()
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
    // check for files
    if (e.clipboardData?.files?.length) {
      // just support pasting one file at a time
      const file = e.clipboardData.files[0]
      if (SUPPORTED_IMAGE_TYPES.includes(file.type)) {
        embedFile(file)
          .then((block: Block) => insert([block]))
          .catch((err) => {
            console.error('[EditorProvider] paste file error', err)
          })
      }
    } else {
      const data = pasteEventHandler(e)
      if (data) {
        insert(data)
      }
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
          stateRef,
          copy,
          cut,
          insert,
          replace,
          paste,
          embedPaste,
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
    [state, onChange]
  )
}

export const useEditorContext = () => useContext(EditorContext)

export default forwardRef(EditorProvider)
