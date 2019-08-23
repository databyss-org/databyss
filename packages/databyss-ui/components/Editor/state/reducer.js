import ObjectId from 'bson-objectid'

import {
  SET_ACTIVE_INDEX,
  MOVE_CARET_LEFT,
  MOVE_CARET_RIGHT,
  INSERT_TEXT_AT_CARET,
  DELETE_BLOCKS,
  INSERT_NEW_BLOCK,
} from './constants'

export const initialState = {
  activeIndex: 1,
  activeTextOffset: 1,
  selectionRange: [43, 55],
  selectedBlocks: ['54495ad94c934721ede76d90', '507f191e810c19729de860ea'],
  documentView: [
    {
      _id: '54495ad94c934721ede76d90',
    },
    {
      _id: '507f191e810c19729de860ea',
    },
    {
      _id: '507f191e810c19729de86555',
    },
  ],
  blocks: {
    '54495ad94c934721ede76d90': {
      type: 'NEW',
      rawText: 'bla bla',
      _id: '54495ad94c934721ede76d90',
    },
    '507f191e810c19729de860ea': {
      type: 'RESOURCE',
      rawText: 'bla',
      _id: '507f191e810c19729de860ea',
    },
    '507f191e810c19729de86555': {
      type: 'ENTRY',
      rawText: 'ips',
      _id: '507f191e810c19729de86555',
    },
  },
}

export const insertCharacterAtIndex = (state, char) => {
  let _state = state
  const newBlocks = _state.blocks
  if (char === 'ArrowRight') {
    return { ..._state, activeTextOffset: state.activeTextOffset + 1 }
  }
  if (char === 'ArrowLeft') {
    return { ..._state, activeTextOffset: state.activeTextOffset - 1 }
  }

  if (char === 'Backspace') {
    const _text = newBlocks[
      state.documentView[state.activeIndex]._id
    ].rawText.split('')
    _text.splice(state.activeTextOffset - 1, 1, '')
    newBlocks[state.documentView[state.activeIndex]._id].rawText = _text.join(
      ''
    )
    return {
      ..._state,
      activeTextOffset: state.activeTextOffset - 1,
      blocks: newBlocks,
    }
  }

  const _text = newBlocks[
    state.documentView[state.activeIndex]._id
  ].rawText.split('')
  _text.splice(state.activeTextOffset, 0, char)
  newBlocks[state.documentView[state.activeIndex]._id].rawText = _text.join('')
  const activeTextOffset = state.activeTextOffset + 1

  _state = {
    ..._state,
    blocks: newBlocks,
    activeTextOffset,
  }

  return _state
}

const moveCaretLeft = state => {
  if (state.activeTextOffset === 0) {
    return {
      ...state,
      activeIndex: Math.max(state.activeIndex - 1, 0),
    }
  }
  return {
    ...state,
    activeTextOffset: state.activeTextOffset - 1,
  }
}

const moveCaretRight = state => {
  // const block = getBlock(state, state.activeIndex)
  const id = state.documentView[state.activeIndex]._id
  const block = state.blocks[id]
  if (block.rawText.length <= state.activeTextOffset) {
    return {
      ...state,
      activeIndex: Math.min(
        state.activeIndex + 1,
        state.documentView.length - 1
      ),
      activeTextOffset: 0,
    }
  }
  return {
    ...state,
    activeTextOffset: Math.min(
      state.activeTextOffset + 1,
      block.rawText.length
    ),
  }
}

const deleteBlock = (state, blockRange) => {
  const newState = state
  const removedBlocks = newState.documentView.splice(
    blockRange[0],
    blockRange[1]
  )
  const newBlocks = newState.blocks
  removedBlocks.forEach(b => {
    delete newBlocks[b._id]
  })
  newState.blocks = newBlocks
  return newState
}

const insertNewBlock = (state, beforeBlockIndex) => {
  const _id = ObjectId().toHexString()
  const newState = state
  const newDocument = newState.documentView
  newDocument.splice(beforeBlockIndex + 1, 0, { _id })

  newState.documentView = newDocument
  newState.blocks[_id] = {
    type: 'NEW',
    rawText: 'enter text',
    _id,
  }
  newState.activeIndex = beforeBlockIndex + 1
  newState.activeTextOffset = 0
  return newState
}

export default (state, action) => {
  let newState

  switch (action.type) {
    case SET_ACTIVE_INDEX:
      return {
        ...state,
        activeIndex: action.payload,
      }
    case INSERT_TEXT_AT_CARET:
      newState = insertCharacterAtIndex(state, action.payload)
      return newState
    case MOVE_CARET_LEFT:
      newState = moveCaretLeft(state)
      return newState
    case MOVE_CARET_RIGHT:
      newState = moveCaretRight(state)
      return newState
    case DELETE_BLOCKS:
      newState = deleteBlock(state, action.payload)
      return newState
    case INSERT_NEW_BLOCK:
      newState = insertNewBlock(state, action.payload)
      return newState

    default:
      return state
  }
}
