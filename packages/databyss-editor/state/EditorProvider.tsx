import React, {
  createContext,
  useContext,
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useEffect,
} from 'react'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import createReducer from '@databyss-org/services/lib/createReducer'
import { useEntryContext } from '@databyss-org/services/entries/EntryProvider'
import { PageHeader } from '@databyss-org/services/interfaces/Page'
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
} from './constants'
import { Text, Selection, EditorState, Block } from '../interfaces'
import initialState from './initialState'
import reducer from './reducer'
import { getPagePath, indexPage, PagePath, BlockRelations } from '../lib/util'
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
  setContent: (transformArray: TransformArray) => void
  setSelection: (selection: Selection) => void
  remove: (index: number) => void
  removeAtSelection: () => void
  removeEntityFromQueue: (id: number) => void
  clear: (index: number) => void
  copy: (event: ClipboardEvent) => void
  cut: (event: ClipboardEvent) => void
  paste: (event: ClipboardEvent) => void
  onBlockRelationsChange: () => void
  insert: (blocks: Block[]) => void
}

export type OnChangeArgs = {
  nextState: EditorState
  previousState: EditorState
  patches: Patch[]
  inversePatches: Patch[]
  undoAction: boolean
  redoAction: boolean
}

export interface EditorRef {
  undo: (patches: Patch[]) => void
  redo: (patches: Patch[]) => void
  pagePath: PagePath
}

type PropsType = {
  ref?: React.RefObject<EditorRef>
  children: JSX.Element
  initialState: EditorState
  onChange: (args: OnChangeArgs) => void
}

const useReducer = createReducer()

export const EditorContext = createContext<ContextType | null>(null)

const EditorProvider: React.FunctionComponent<PropsType> = forwardRef(
  ({ children, initialState, onChange }, ref) => {
    const [state, dispatch] = useReducer(reducer, initialState, {
      initializer: null,
      name: 'EditorProvider',
      onChange,
    })

    const setBlockRelations = useEntryContext(c => c && c.setBlockRelations)

    const getPages = usePageContext(c => c && c.getPages)

    let pages
    if (getPages) {
      pages = getPages()
    }

    let _pageHeader: PageHeader | null = null
    // get page title
    if (pages && pages[state.pageHeader._id]) {
      _pageHeader = pages[state.pageHeader._id]
    }

    /*
    get the page and block relations at current index
    */

    const pagePathRef = useRef(getPagePath(state, _pageHeader))
    const stateRef = useRef(state)
    stateRef.current = state

    useEffect(
      () => {
        setTimeout(() => {
          pagePathRef.current = getPagePath(stateRef.current, _pageHeader)
        }, 100)
      },
      [JSON.stringify(state.selection.anchor)]
    )

    // this should be run if number of blocks changes
    // or when an atomic is created or removed
    // or clipboard or history action
    const onBlockRelationsChange = (
      currentBlockRelations: BlockRelations[] | void
    ) => {
      if (setBlockRelations) {
        // when indexing the whole page
        if (!currentBlockRelations) {
          setTimeout(() => {
            setBlockRelations(
              indexPage({ pageHeader: _pageHeader, blocks: state.blocks })
            )
          }, 100)
        } else {
          // if block relations are passed, push relations upstream
          setBlockRelations(currentBlockRelations)
        }
      }
    }

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
      onBlockRelationsChange()
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
      onBlockRelationsChange()
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
      onBlockRelationsChange(pagePathRef.current.blockRelations)
      dispatch({
        type: SET_CONTENT,
        payload: transformArray,
      })
    }

    /**
     * Remove the block at `index`
     */
    const remove = (index: number): void => {
      onBlockRelationsChange()
      dispatch({
        type: REMOVE,
        payload: { index },
      })
    }

    /**
     * Remove text currently selected. May span multiple blocks
     */
    const removeAtSelection = (): void => {
      onBlockRelationsChange()
      dispatch({
        type: REMOVE_AT_SELECTION,
      })
    }

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
      onBlockRelationsChange()
      const _frag = getFragmentAtSelection(state)
      cutOrCopyEventHandler(e, _frag)
      dispatch({
        type: CUT,
      })
    }

    const copy = (e: ClipboardEvent) => {
      onBlockRelationsChange()
      const _frag = getFragmentAtSelection(state)
      cutOrCopyEventHandler(e, _frag)

      dispatch({
        type: COPY,
      })
    }

    const insert = (blocks: Block[]) => {
      dispatch({
        type: PASTE,
        payload: {
          data: blocks,
        },
      })
    }

    const paste = (e: ClipboardEvent) => {
      onBlockRelationsChange()
      const data = pasteEventHandler(e)
      if (data) {
        insert(data)
      }
    }

    return (
      <EditorContext.Provider
        value={{
          state,
          copy,
          cut,
          insert,
          paste,
          setSelection,
          setContent,
          split,
          merge,
          remove,
          removeAtSelection,
          clear,
          removeEntityFromQueue,
          onBlockRelationsChange,
        }}
      >
        {children}
      </EditorContext.Provider>
    )
  }
)

export const useEditorContext = () => useContext(EditorContext)

EditorProvider.defaultProps = {
  onChange: () => null,
  // ref: PropTypes.object,
  initialState,
}

export default EditorProvider
