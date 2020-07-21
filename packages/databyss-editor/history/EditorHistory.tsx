import React, { createContext, useContext, useRef } from 'react'
import { OnChangeArgs, RefInputHandles } from '../state/EditorProvider'
import { debounce, throttle } from 'lodash'
import { Patch } from 'immer'
import {
  pageToEditorState,
  cleanupPatches,
  addMetaToPatches,
  filterInversePatches,
} from '@databyss-org/editor/state/util'

const THROTTLE_UNDO = 1000

type ContextType = {
  undo: () => void
  redo: () => void
}

type UndoType = Patch[][]

type PropsType = {
  children: JSX.Element
}

export const HistoryContext = createContext<ContextType | null>(null)

const HistoryProvider: React.FunctionComponent<PropsType> = ({ children }) => {
  const childRef = useRef<RefInputHandles>(null)
  const undoPatchQueue = useRef<Patch[]>([])
  const undoStack = useRef<UndoType>([])
  const redoStack = useRef<UndoType>([])

  const undo = () => {
    let _undoBatch
    // if pending patches, undo pending patches
    if (undoPatchQueue.current.length) {
      _undoBatch = undoPatchQueue.current
      undoPatchQueue.current = []
    } else {
      // remove from stack
      _undoBatch = undoStack.current.pop()
    }

    //  const

    if (_undoBatch && _undoBatch.length && childRef.current) {
      if (childRef.current) {
        childRef.current.undo(_undoBatch)
        // window.requestAnimationFrame(() =>
        //   redoStack.current.push(_undoBatch.reverse())
        // )
      }
    }
  }

  const redo = () => {
    const _redoBatch = redoStack.current.pop()

    if (_redoBatch && _redoBatch.length && childRef.current) {
      // apply redo
      childRef.current.redo(_redoBatch)
      // place patch back in undo stack
      //   undoStack.current.push(_redoBatch)

      // //  console.log(redoStack.current)
      // console.log('HAS REDO')
    }
  }

  const forkOnChange = ({
    inversePatches,
    patches,
    undoAction,
    redoAction,
    clipboardAction,
    ...others
  }: OnChangeArgs) => {
    const { onChange } = children.props
    // push to a patch batch if not a history action
    if (!undoAction) {
      // if action is not a redo action, clear redo stack
      if (!redoAction) {
        redoStack.current = []
      }

      const _filteredPatches = filterInversePatches(inversePatches)

      // clipboard actions need to be reversed
      if (clipboardAction) {
        _filteredPatches.reverse()
      }

      undoPatchQueue.current = undoPatchQueue.current.concat(_filteredPatches)

      // group events on a throttle
      trottleUndoStack()
    } else {
      // if a history event, push to redo stack
      const _filteredPatches = filterInversePatches(inversePatches)

      // console.log(_filteredPatches)

      // if (clipboardAction) {
      //   console.log('REVERSE IF CLIPBOARD')
      //   _filteredPatches.reverse()
      // }
      redoStack.current.push(_filteredPatches)
    }

    onChange({ inversePatches, patches, ...others })
  }

  const trottleUndoStack = throttle(() => {
    undoStack.current.push(undoPatchQueue.current)
    undoPatchQueue.current = []
  }, THROTTLE_UNDO)

  return (
    <HistoryContext.Provider
      value={{
        undo,
        redo,
      }}
    >
      {React.cloneElement(children, {
        onChange: forkOnChange,
        ref: childRef,
      })}
    </HistoryContext.Provider>
  )
}

export const useHistoryContext = () => useContext(HistoryContext)

HistoryProvider.defaultProps = {
  // onChange: () => null,
  // initialState,
}

export default HistoryProvider
