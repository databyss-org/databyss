import _ from 'lodash'
import { appendBlock, placeCaretAtEnd, getPos } from './../_helpers'

const focusBlock = ({ ref, index }) => dispatch => {
  dispatch({ type: 'FOCUS_BLOCK', data: ref, index })
}

export const setRef = ({ ref, index }) => (dispatch, getState) => {
  const { blocks } = getState()
  const newIndex = index === -1 || _.isEmpty(index) ? blocks.length - 1 : index
  const newBlocks = blocks
  newBlocks[newIndex] = {
    ...newBlocks[newIndex],
    ref,
    index: newIndex,
  }
  // if new ref
  if (index === -1 || _.isEmpty(index)) {
    dispatch(focusBlock({ ref, index: newIndex }))
  }
  dispatch({ type: 'SET_REF', data: newBlocks, index: newIndex })
}

export const setEditRef = (ref, i) => dispatch => {
  dispatch({ type: 'EDIT_REF', data: ref.current, index: i })
}

export const setFocus = () => dispatch => {
  dispatch({ type: 'SET_FOCUS' })
}

export const onEdit = data => (dispatch, getState) => {
  const { editIndex, blocks } = getState()
  const newState = {}
  if (!_.isEqual(data === blocks[editIndex])) {
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
        blocks,
        index: editIndex,
        addNewBlock: true,
      })
      newState.blocks = newBlocks
    } else {
      blocks[data.index] = { ...data /* , type: 'ENTRY' */ }
      newState.blocks = blocks
    }
  }
  dispatch({ type: 'ON_EDIT', data: newState })
}

export const removeBlock = () => dispatch => {
  dispatch({ type: 'REMOVE_BLOCK' })
  // ADD REMOVE LOGIC HERE
}

export const onBackspace = () => (dispatch, getState) => {
  const { editIndex, blocks } = getState()
  dispatch({ type: 'BACKSPACE' })
  if (blocks[editIndex].html.length === 0 && blocks[editIndex].type === 'NEW') {
    dispatch(removeBlock())
  }
}

export const onNewLine = () => (dispatch, getState) => {
  const { blocks, editIndex } = getState()
  let newState = {}
  const currentBlock = blocks[editIndex]
  if (
    currentBlock.type === 'RESOURCE' ||
    currentBlock.type === 'LOCATION' ||
    currentBlock.type === 'HEADER' ||
    currentBlock.type === 'TAG' ||
    currentBlock.type === 'NEW' ||
    currentBlock.type === ''
  ) {
    const newBlocks = appendBlock({
      blocks,
      index: editIndex,
      addNewBlock: true,
    })

    newState = {
      blocks: newBlocks,
      editIndex: newBlocks.length - 1,
    }
  }
  dispatch({ type: 'NEW_LINE', data: newState })
}

export const onUpKey = () => (dispatch, getState) => {
  const { lastCarotPosition, editIndex, blocks } = getState()
  const newState = {
    lastCarotPosition: getPos(document.activeElement),
  }
  if (lastCarotPosition === 0) {
    if (editIndex > -1) {
      const index = editIndex === 0 ? 0 : editIndex - 1
      const ref = blocks[index].ref
      focusBlock({ ref, index })
      if (editIndex !== 0) {
        placeCaretAtEnd(blocks[index].ref)
      }
      // set focus to previous block from 'blocks'
      newState.lastCarotPosition = getPos(document.activeElement)
      newState.editIndex = index
    } else {
      // set focus to last block in 'blocks'
      const index = blocks.length - 1
      const ref = blocks[index].ref
      focusBlock({ ref, index })
      newState.lastCarotPosition = getPos(document.activeElement)
    }
  } else {
    newState.lastCarotPosition = getPos(document.activeElement)
  }
  dispatch({ type: 'UP', data: newState })
}

export const onDownKey = () => (dispatch, getState) => {
  const { lastCarotPosition, blocks, editIndex } = getState()
  let newState = {}
  if (
    lastCarotPosition === blocks[editIndex].rawText.replace(/[\n\r]/, '').length
  ) {
    const _editIndex = editIndex + 1 < blocks.length ? editIndex + 1 : editIndex
    const ref = blocks[_editIndex].ref
    focusBlock({ ref, index: _editIndex })
    // state.blocks[editIndex].ref.focus()
    newState = {
      _editIndex,
    }
  }
  newState.lastCarotPosition = getPos(document.activeElement)
  dispatch({ type: 'DOWN', data: newState })
}
