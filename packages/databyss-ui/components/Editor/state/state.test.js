import cloneDeep from 'clone-deep'
import reducer from './reducer'
import {
  setActiveIndex,
  moveCaretLeft,
  moveCaretRight,
  moveCaretUp,
  moveCaretDown,
  textChange,
  deleteBlocks,
  insertNewBlock,
} from './actions'

import {
  SET_ACTIVE_INDEX,
  MOVE_CARET_LEFT,
  MOVE_CARET_RIGHT,
  MOVE_CARET_UP,
  MOVE_CARET_DOWN,
  //   SELECT_TEXT,
  TEXT_CHANGE,
  DELETE_BLOCKS,
  INSERT_NEW_BLOCK,
  //   SELECT_BLOCKS,
  //   COPY_BLOCKS,
  //   PASTE_BLOCKS,
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
    state = reducer(state, moveCaretRight())
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

describe(MOVE_CARET_UP, () => {
  let state = cloneDeep(initialState)
  test('should move up an index value', () => {
    state = reducer(state, moveCaretUp())
    expect(state.activeIndex).toEqual(0)
  })
})

describe(MOVE_CARET_DOWN, () => {
  let state = cloneDeep(initialState)
  test('should move up an index value', () => {
    state = reducer(state, moveCaretDown())
    expect(state.activeIndex).toEqual(2)
  })
  test('should stay the same', () => {
    state = reducer(state, moveCaretDown())
    expect(state).toEqual(state)
  })
})

describe(TEXT_CHANGE, () => {
  let state = cloneDeep(initialState)
  const text = 'new text'
  test('it should change the text', () => {
    state = reducer(state, textChange(text))
    const newText = state.blocks[state.document[state.activeIndex]._id].rawText
    expect(newText).toEqual(text)
  })
})

describe(INSERT_NEW_BLOCK, () => {
  let state = cloneDeep(initialState)
  state = reducer(state, insertNewBlock(1))
  test('it should insert a new block in documents and blocks with the same id', () => {
    expect(state.document.length).toEqual(4)
  })
})

describe(DELETE_BLOCKS, () => {
  let state = cloneDeep(initialState)
  const blockRange = [1, 2]
  test('it should delete a block range', () => {
    state = reducer(state, deleteBlocks(blockRange))
    expect(1).toEqual(state.document.length)
  })
})
