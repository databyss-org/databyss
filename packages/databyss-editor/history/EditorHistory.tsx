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

type UndoType = Patch[][]

type PropsType = {
  children: JSX.Element
}

export const HistoryContext = createContext<ContextType | null>(null)

const HistoryProvider: React.FunctionComponent<PropsType> = ({ children }) => {
  const childRef = useRef<RefInputHandles>(null)
  const undoPatchQueue = useRef<Patch[]>([])
  const undoStack = useRef<UndoType>([])

  const undo = () => {
    // get pending from queue
    let _undoBatch

    if (undoPatchQueue.current.length) {
      console.log('HAS LENGTH')
      _undoBatch = undoPatchQueue.current
      undoPatchQueue.current = []
    } else {
      _undoBatch = undoStack.current.pop()
    }

    //  const

    if (_undoBatch && _undoBatch.length && childRef.current) {
      if (childRef.current) {
        childRef.current.applyPatch(_undoBatch)
      }
    }

    // if(_undoBatch?.length && childRef.current){
    //   childRef.current?.applyPatch(_undoBatch)
    // }
  }

  const redo = () => {}

  const forkOnChange = ({
    inversePatches,
    patches,
    historyAction,
    clipboardAction,
    ...others
  }: OnChangeArgs) => {
    // console.log(inversePatches)
    const { onChange } = children.props
    // console.log(clipboardAction)
    // push to a patch batch
    if (!historyAction) {
      const _filteredPatches = inversePatches.filter(
        p =>
          (p.path[0] === 'blocks' || p.path[0] === 'selection') &&
          !p.path.find(_p => typeof _p === 'string' && _p.search('__') !== -1)
      )

      if (clipboardAction) {
        _filteredPatches.reverse()
      }
      // filter out any path that doesnt contain `blocks` or `selection` and does not contain `__` metadata
      undoPatchQueue.current = undoPatchQueue.current.concat(_filteredPatches)

      // group events on a throttle
      trottleUndoStack()
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
