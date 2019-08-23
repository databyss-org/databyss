// import ObjectId from 'bson-objectid'

import { getBlock, typeSelector } from './_helpers'
import {
  SET_ACTIVE_INDEX,
  MOVE_CARET_LEFT,
  MOVE_CARET_RIGHT,
  MOVE_CARET_UP,
  MOVE_CARET_DOWN,
  SELECT_TEXT,
  TEXT_CHANGE,
  DELETE_BLOCKS,
  INSERT_NEW_BLOCK,
  SELECT_BLOCKS,
  COPY_BLOCKS,
  PASTE_BLOCKS,
} from './constants'

export const initialState = {
  activeIndex: 1,
  activeTextColumn: 1,
  selectionRange: [43, 55],
  selectedBlocks: ['54495ad94c934721ede76d90', '507f191e810c19729de860ea'],
  document: [
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

/*
export const initialState = {
  activeIndex: 0,
  activeTextColumn: 0,
  selectionRange: [0, 0],
  selectedBlocks: [],
  document: [
    {
      _id: '',
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
      _id: '54495ad94c934721ede76d90',
    },
  },
}
*/

export const insertCharacterAtIndex = (state, char) => {
  let _state = state
  let newBlocks = _state.blocks
  if (char === 'ArrowRight') {
    return { ..._state, activeTextOffset: state.activeTextOffset + 1 }
  }
  if (char === 'ArrowLeft') {
    return { ..._state, activeTextOffset: state.activeTextOffset - 1 }
  }

  if (char === 'Backspace') {
    let _text = newBlocks[
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

  let _text = newBlocks[
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
  if (state.activeTextColumn === 0) {
    return {
      ...state,
      activeIndex: Math.max(state.activeIndex - 1, 0),
    }
  }
  return {
    ...state,
    activeTextColumn: state.activeTextColumn - 1,
  }
}

const moveCaretRight = state => {
  const block = getBlock(state, state.activeIndex)
  if (block.rawText.length <= state.activeTextColumn) {
    return {
      ...state,
      activeIndex: Math.min(state.activeIndex + 1, state.document.length - 1),
      activeTextColumn: 0,
    }
  }
  return {
    ...state,
    activeTextColumn: Math.min(
      state.activeTextColumn + 1,
      block.rawText.length
    ),
  }
}

const changeText = (state, text) => {
  let newState = state
  newState.blocks[state.document[state.activeIndex]._id].rawText = text
  newState.blocks[state.document[state.activeIndex]._id].type = typeSelector(
    text
  )

  return newState
}

const deleteBlock = (state, blockRange) => {
  let newState = state
  let removedBlocks = newState.document.splice(blockRange[0], blockRange[1])
  let newBlocks = newState.blocks
  removedBlocks.forEach(b => {
    delete newBlocks[b._id]
  })
  newState.blocks = newBlocks
  return newState
}

const insertNewBlock = (state, beforeBlockIndex) => {
  const _id = ObjectId().toHexString()
  let newState = state
  let newDocument = newState.document
  newDocument.splice(beforeBlockIndex + 1, 0, { _id })

  newState.document = newDocument
  newState.blocks[_id] = {
    type: 'NEW',
    rawText: 'enter text',
    _id,
  }
  newState.activeIndex = beforeBlockIndex + 1
  newState.activeTextColumn = 0
  return newState
}

export const reducer = (state, action) => {
  let newState

  switch (action.type) {
    case SET_ACTIVE_INDEX:
      return {
        ...state,
        activeIndex: action.payload,
      }
    case MOVE_CARET_LEFT:
      newState = moveCaretLeft(state)
      return newState
    case MOVE_CARET_RIGHT:
      newState = moveCaretRight(state)
      return newState
    case MOVE_CARET_UP:
      return {
        ...state,
        activeIndex: Math.max(state.activeIndex - 1, 0),
      }
    case MOVE_CARET_DOWN:
      return {
        ...state,
        activeIndex: Math.min(state.activeIndex + 1, state.document.length - 1),
      }
    case TEXT_CHANGE:
      newState = changeText(state, action.payload)
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
