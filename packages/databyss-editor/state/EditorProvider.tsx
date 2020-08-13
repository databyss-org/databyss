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

const isSetBlockRelations = [
  SPLIT,
  PASTE,
  MERGE,
  REMOVE,
  REMOVE_AT_SELECTION,
  CUT,
  COPY,
  PASTE,
]

export const EditorContext = createContext<ContextType | null>(null)

const EditorProvider: React.FunctionComponent<PropsType> = forwardRef(
  ({ children, initialState, onChange }, ref) => {
    const setBlockRelations = useEntryContext(c => c && c.setBlockRelations)
    // get the current page header
    const getPages = usePageContext(c => c && c.getPages)
    const pageHeaders = useRef<PageHeader | null>(getPages ? getPages() : null)
    const pagePathRef = useRef<PagePath>({ path: [], blockRelations: [] })

    // TODO: when page name changes, block relation needs to run whole page
    useEffect(
      () => {
        pageHeaders.current = getPages()
      },
      [getPages()]
    )

    const forkOnChange = props => {
      //  const _pages = getUpdatedPageName()
      let _pageHeader: PageHeader | null = null
      // get current page title
      if (
        pageHeaders.current &&
        pageHeaders.current[props.nextState.pageHeader._id]
      ) {
        _pageHeader = pageHeaders.current[props.nextState.pageHeader._id]
      }

      pagePathRef.current = getPagePath(props.nextState, _pageHeader)

      if (onChange) {
        const _idx = isSetBlockRelations.findIndex(t => t === props.type)
        if (_idx > -1) {
          setBlockRelations(
            indexPage({
              pageHeader: _pageHeader,
              blocks: props.nextState.blocks,
            })
          )
        } else if (props.type === SET_CONTENT && pagePathRef.current) {
          /*
          get the page and block relations at current index
          */
          setBlockRelations(pagePathRef.current.blockRelations)
        }
        onChange(props)
      }
    }

    const [state, dispatch] = useReducer(reducer, initialState, {
      initializer: null,
      name: 'EditorProvider',
      onChange: forkOnChange,
    })

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

    const insert = (blocks: Block[]) => {
      dispatch({
        type: PASTE,
        payload: {
          data: blocks,
        },
      })
    }

    const paste = (e: ClipboardEvent) => {
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
