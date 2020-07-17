import React, { createContext, useContext, useRef } from 'react'
import { OnChangeArgs, RefInputHandles } from '../state/EditorProvider'
import { debounce, throttle } from 'lodash'
import { Patch } from 'immer'
import {
  pageToEditorState,
  cleanupPatches,
  addMetaToPatches,
} from '@databyss-org/editor/state/util'

const THROTTLE_UNDO = 1000

type ContextType = {
  undo: () => void
  redo: () => void
}

type UndoType = Array<Patch[]>

type PropsType = {
  children: JSX.Element
}

export const HistoryContext = createContext<ContextType | null>(null)

const HistoryProvider: React.FunctionComponent<PropsType> = ({ children }) => {
  const childRef = useRef<RefInputHandles>(null)
  const patchQueue = useRef<Patch[]>([])
  const undoStack = useRef<UndoType>([])

  const undo = () => {
    const _undoBatch = undoStack.current.pop()
    console.log('IS UNDO', _undoBatch)
  }

  const redo = () => {}

  const forkOnChange = ({
    inversePatches,
    patches,
    ...others
  }: OnChangeArgs) => {
    const { onChange } = children.props
    const _patches = addMetaToPatches({
      inversePatches,
      patches,
      ...others,
    })
    // push to a patch batch
    patchQueue.current = patchQueue.current.concat(_patches)
    // group events on a throttle
    trottleUndoStack()
    onChange({ inversePatches, patches, ...others })
  }

  const trottleUndoStack = throttle(() => {
    undoStack.current.push(patchQueue.current)
    patchQueue.current = []
  }, THROTTLE_UNDO)

  return (
    <HistoryContext.Provider
      value={{
        undo,
        redo,
      }}
    >
      <button onClick={undo}>undo</button>
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
