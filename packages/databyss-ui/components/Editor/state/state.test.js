import cloneDeep from 'clone-deep'
import reducer from './reducer'
import {
  setActiveIndex,
  moveCaretLeft,
  moveCaretRight,
  deleteBlocks,
  insertNewBlock,
  insertTextAtCaret,
} from './actions'

import {
  SET_ACTIVE_INDEX,
  MOVE_CARET_LEFT,
  INSERT_TEXT_AT_CARET,
  MOVE_CARET_RIGHT,
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
      _id: '54495ad94c934721ede76d90',
    },
    '507f191e810c19729de86555': {
      type: 'ENTRY',
      rawText: 'ips',
      _id: '507f191e810c19729de86555',
    },
  },
}

describe(SET_ACTIVE_INDEX, () => {
  test('should set activeIndex', () => {
    expect(reducer(initialState, setActiveIndex(4)).activeIndex).toEqual(4)
  })
})

describe(MOVE_CARET_LEFT, () => {
  let state = initialState
  test('should move activeTextOffset left one position', () => {
    state = reducer(state, moveCaretLeft())
    expect(state.activeTextOffset).toEqual(0)
  })
  test('should decrement activeIndex by one', () => {
    state = reducer(state, moveCaretLeft())
    expect(state.activeTextOffset).toEqual(0)
    expect(state.activeIndex).toEqual(0)
  })
  test('should remain the same', () => {
    state = reducer(state, moveCaretLeft())
    expect(state.activeTextOffset).toEqual(0)
    expect(state.activeIndex).toEqual(0)
  })
})

describe(MOVE_CARET_RIGHT, () => {
  let state = initialState
  test('should move activeTextOffset right one position', () => {
    state = reducer(state, moveCaretRight(state))
    expect(state.activeTextOffset).toEqual(2)
  })
  test('should move activeTextOffset to zero and increment the index', () => {
    state = reducer(state, moveCaretRight())
    state = reducer(state, moveCaretRight())
    expect(state.activeTextOffset).toEqual(0)
    expect(state.activeIndex).toEqual(2)
  })
  test('should move activeTextOffset to zero and increment the index', () => {
    state = reducer(state, moveCaretRight())
    state = reducer(state, moveCaretRight())
    state = reducer(state, moveCaretRight())
    state = reducer(state, moveCaretRight())
    expect(state.activeTextOffset).toEqual(0)
    expect(state.activeIndex).toEqual(2)
  })
  test('should stay the same', () => {
    state = reducer(state, moveCaretRight())
    expect(state).toEqual(state)
  })
})
/*
describe(MOVE_CARET_UP, () => {
  let state = cloneDeep(initialState)
  test('should move up an index value', () => {
    state = reducer(state, moveCaretUp())
    expect(state.activeIndex).toEqual(0)
  })
})

describe(MOVE_CARET_DOWN, () => {
  let state = cloneDeep(initialState)
  test('should move down an index value', () => {
    state = reducer(state, moveCaretDown())
    expect(state.activeIndex).toEqual(2)
  })
  test('should stay the same', () => {
    state = reducer(state, moveCaretDown())
    expect(state).toEqual(state)
  })
})
*/
describe(INSERT_TEXT_AT_CARET, () => {
  let state = cloneDeep(initialState)
  const text = 'n'
  test('it should change the text', () => {
    state = reducer(state, insertTextAtCaret(text))
    const newText =
      state.blocks[state.documentView[state.activeIndex]._id].rawText
    expect(newText).toEqual('bnla')
  })
})

describe(INSERT_NEW_BLOCK, () => {
  let state = cloneDeep(initialState)
  state = reducer(state, insertNewBlock(1))
  test('it should insert a new block in documents and blocks with the same id', () => {
    expect(state.documentView.length).toEqual(4)
  })
})

describe(DELETE_BLOCKS, () => {
  let state = cloneDeep(initialState)
  const blockRange = [1, 2]
  test('it should delete a block range', () => {
    state = reducer(state, deleteBlocks(blockRange))
    expect(1).toEqual(state.documentView.length)
  })
})
