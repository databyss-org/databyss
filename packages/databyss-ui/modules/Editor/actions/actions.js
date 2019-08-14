import _ from 'lodash'
import { appendBlock, placeCaretAtEnd, getPos } from './../_helpers.js'

export const actions = (dispatch, state) => {
  const setRef = ({ ref, index }) => {
    let newIndex =
      index === -1 || _.isEmpty(index) ? state.blocks.length - 1 : index
    let newBlocks = state.blocks
    newBlocks[newIndex] = {
      ...newBlocks[newIndex],
      ref: ref,
      index: newIndex,
    }
    // if new ref
    if (index === -1 || _.isEmpty(index)) {
      focusBlock({ ref, index: newIndex })
    }
    dispatch({ type: 'SET_REF', data: newBlocks, index: newIndex })
  }

  const focusBlock = ({ ref, index }) => {
    dispatch({ type: 'FOCUS_BLOCK', data: ref, index })
  }

  const setEditRef = (ref, i) => {
    dispatch({ type: 'EDIT_REF', data: ref.current, index: i })
  }

  const setFocus = () => {
    dispatch({ type: 'SET_FOCUS' })
  }

  const onEdit = data => {
    let newState = {}
    if (!_.isEqual(data === state.blocks[state.editIndex])) {
      let blocks = state.blocks
      if (data.rawText.length === 0) {
        blocks[data.index] = {
          ...data,
          html: '',
          rawText: '',
          type: 'NEW',
        }
        newState.blocks = blocks
      } else if (data.rawText[0] === '@') {
        blocks[data.index] = { ...data, type: 'RESOURCE' }
        newState.blocks = blocks
      } else if (data.rawText.substring(0, 2) === '##') {
        blocks[data.index] = { ...data, type: 'TAG' }
        newState.blocks = blocks
      } else if (data.rawText.substring(0, 1) === '#') {
        blocks[data.index] = { ...data, type: 'HEADER' }
        newState.blocks = blocks
      } else if (data.rawText.substring(0, 2) === '//') {
        blocks[data.index] = { ...data, type: 'LOCATION' }
        newState.blocks = blocks
      } else if (data.html.match('<div><br></div><div><br></div>')) {
        // FOCUS BLOCK
        const newBlocks = appendBlock({
          blocks: state.blocks,
          index: state.editIndex,
          addNewBlock: true,
        })
        newState.blocks = newBlocks
      } else {
        blocks[data.index] = { ...data /*, type: 'ENTRY' */ }
        newState.blocks = blocks
      }
    }
    dispatch({ type: 'ON_EDIT', data: newState })
  }

  const onBackspace = () => {
    dispatch({ type: 'BACKSPACE' })
    if (
      state.blocks[state.editIndex].html.length === 0 &&
      state.blocks[state.editIndex].type === 'NEW'
    ) {
      let blocks = state.blocks
      removeBlock()
    }
  }

  const removeBlock = () => {
    dispatch({ type: 'REMOVE_BLOCK' })
    // ADD REMOVE LOGIC HERE
  }

  const onNewLine = () => {
    let newState = {}
    const currentBlock = state.blocks[state.editIndex]
    if (
      currentBlock.type === 'RESOURCE' ||
      currentBlock.type === 'LOCATION' ||
      currentBlock.type === 'HEADER' ||
      currentBlock.type === 'TAG' ||
      currentBlock.type === 'NEW' ||
      currentBlock.type === ''
    ) {
      const newBlocks = appendBlock({
        blocks: state.blocks,
        index: state.editIndex,
        addNewBlock: true,
      })

      newState = {
        blocks: newBlocks,
        editIndex: newBlocks.length - 1,
      }
    }
    dispatch({ type: 'NEW_LINE', data: newState })
  }

  const onUpKey = () => {
    let newState = {
      lastCarotPosition: getPos(document.activeElement),
    }
    if (state.lastCarotPosition === 0) {
      if (state.editIndex > -1) {
        const index = state.editIndex === 0 ? 0 : state.editIndex - 1
        const ref = state.blocks[index].ref
        focusBlock({ ref, index })
        if (state.editIndex !== 0) {
          placeCaretAtEnd(state.blocks[index].ref)
        }
        // set focus to previous block from 'blocks'
        newState.lastCarotPosition = getPos(document.activeElement)
        newState.editIndex = index
      } else {
        // set focus to last block in 'blocks'
        const index = state.blocks.length - 1
        const ref = state.blocks[index].ref
        focusBlock({ ref, index })
        newState.lastCarotPosition = getPos(document.activeElement)
      }
    } else {
      newState.lastCarotPosition = getPos(document.activeElement)
    }
    dispatch({ type: 'UP', data: newState })
  }

  const onDownKey = () => {
    let newState = {}
    if (
      state.lastCarotPosition ===
      state.blocks[state.editIndex].rawText.replace(/[\n\r]/, '').length
    ) {
      const editIndex =
        state.editIndex + 1 < state.blocks.length
          ? state.editIndex + 1
          : state.editIndex
      const ref = state.blocks[editIndex].ref
      focusBlock({ ref, index: editIndex })
      // state.blocks[editIndex].ref.focus()
      newState = {
        editIndex,
      }
    }
    newState.lastCarotPosition = getPos(document.activeElement)
    dispatch({ type: 'DOWN', data: newState })
  }

  return {
    setRef,
    setEditRef,
    setFocus,
    onEdit,
    onBackspace,
    onNewLine,
    onUpKey,
    onDownKey,
    removeBlock,
  }
}
