import React, { createContext, useContext, useRef } from 'react'
import { OnChangeArgs, RefInputHandles } from '../state/EditorProvider'
import { throttle } from 'lodash'
import { Patch } from 'immer'
import { filterInversePatches } from '@databyss-org/editor/state/util'

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
    // if pending patches, undo pending patches first
    if (undoPatchQueue.current.length) {
      _undoBatch = undoPatchQueue.current.reverse()
      undoPatchQueue.current = []
    } else {
      // remove pop undo from stack
      _undoBatch = undoStack.current.pop()
    }

    if (_undoBatch && _undoBatch.length && childRef.current) {
      if (childRef.current) {
        childRef.current.undo(_undoBatch)
      }
    }
  }

  const redo = () => {
    const _redoBatch = redoStack.current.pop()

    if (_redoBatch && _redoBatch.length && childRef.current) {
      // apply redo
      childRef.current.redo(_redoBatch)
    }
  }

  const forkOnChange = ({
    inversePatches,
    patches,
    undoAction,
    redoAction,
    ...others
  }: OnChangeArgs) => {
    const { onChange } = children.props
    // push to a patch batch if not a history action
    if (!undoAction) {
      const _filteredPatches = filterInversePatches(inversePatches)

      // if action is not a redo action, clear redo stack
      if (!redoAction && _filteredPatches.length) {
        redoStack.current = []
      }

      undoPatchQueue.current = undoPatchQueue.current.concat(
        _filteredPatches.reverse()
      )

      // group events on a throttle
      trottleUndoStack()
    } else {
      // if a history event, push to redo stack
      const _filteredPatches = filterInversePatches(inversePatches)
      redoStack.current.push(_filteredPatches)
    }

    onChange({ inversePatches, patches, ...others })
  }

  const trottleUndoStack = throttle(() => {
    if (undoPatchQueue.current.length) {
      undoStack.current.push(undoPatchQueue.current.reverse())
      undoPatchQueue.current = []
    }
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

HistoryProvider.defaultProps = {}

export default HistoryProvider
