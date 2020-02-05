import regression from 'regression'
import ObjectId from 'bson-objectid'
import { List } from 'immutable'
import cloneDeep from 'clone-deep'
import reducer, { entities } from '../page/reducer'
import {
  SET_ACTIVE_BLOCK_CONTENT,
  SET_ACTIVE_BLOCK_TYPE,
  INSERT_NEW_ACTIVE_BLOCK,
  BACKSPACE,
  DELETE_BLOCK,
  DELETE_BLOCKS,
  ON_CUT,
  SHOW_MENU_ACTIONS,
  SHOW_FORMAT_MENU,
  SHOW_NEW_BLOCK_MENU,
  ADD_DIRTY_ATOMIC,
  DEQUEUE_DIRTY_ATOMIC,
  UPDATE_ATOMIC,
  DEQUEUE_NEW_ATOMIC,
} from '../page/constants'
import {
  setActiveBlockId,
  setActiveBlockContent,
  setActiveBlockType,
  newActiveBlock,
  onShowFormatMenu,
  newBlockMenu,
  onShowMenuActions,
  backspace,
  deleteBlock,
  deleteBlocks,
  cutBlocks,
  updateAtomic,
  removeAtomicFromQueue,
  addDirtyAtomic,
  dequeueDirtyAtomic,
} from '../page/actions'
import { generateState, getBlockSize, SMALL, MED, LARGE } from './_helpers'

// how long a function should take
const TIME_DELTA_THRESHOLD = 30
const SAMPLE_SIZE = 2
const SLOPE_THRESHOLD = 0.015

function getAvg(threshold) {
  const total = threshold.reduce((acc, c) => acc + c, 0)
  return parseFloat(total / threshold.length)
}

/*
takes in a (state, , type, size) => {
  processes reducerFunctions
  returns {maxDelta: Array, averageSlope: Array, type: String}
}
*/
export const speedTrap = reducerFunctions => {
  const _size = [SMALL, MED, LARGE]
  const slopes = []
  const maxDeltas = []
  let _type
  for (let i = 0; i < SAMPLE_SIZE; i += 1) {
    const deltas = []
    /* eslint-disable */
    _size.forEach(size => {
      const _state = generateState(size)
      const time = performance.now()
      const { type } = reducerFunctions(_state, size)
      _type = type
      const diff = performance.now() - time
      deltas.push(diff)
      if (size === LARGE) {
        maxDeltas.push(diff)
      }
    })
    /* eslint-enable */

    const points = deltas.map((d, j) => [getBlockSize(_size[j]), d])
    slopes.push(regression.linear(points).equation[0])
  }
  return { averageSlopes: slopes, maxDeltas, type: _type }
}

/*
Action functions to be tested, 
must return a 'type' object in order to lable the test
*/
const changeBlockContent = (state, size) => {
  let _state = state
  const _index = Math.floor(Math.random() * getBlockSize(size))
  const _id = _state.page.blocks[_index]._id
  _state = reducer(_state, setActiveBlockId(_id))
  _state = reducer(_state, setActiveBlockContent('updated content'))
  return {
    type: {
      name: SET_ACTIVE_BLOCK_CONTENT,
      delta: TIME_DELTA_THRESHOLD,
      slope: 0.025,
    },
  }
}

const changeBlockToAtomic = (state, size) => {
  let _state = state
  const _index = Math.floor(Math.random() * getBlockSize(size))
  const _id = _state.page.blocks[_index]._id
  _state = reducer(_state, setActiveBlockId(_id))
  _state = reducer(_state, setActiveBlockType('SOURCE'))
  return {
    type: {
      name: `${SET_ACTIVE_BLOCK_TYPE} - ATOMIC`,
      delta: TIME_DELTA_THRESHOLD,
      slope: SLOPE_THRESHOLD,
    },
  }
}

const changeBlockToEntry = (state, size) => {
  let _state = state
  const _index = Math.floor(Math.random() * getBlockSize(size))
  const _id = _state.page.blocks[_index]._id
  _state = reducer(_state, setActiveBlockId(_id))
  _state = reducer(_state, setActiveBlockType('ENTRY'))
  return {
    type: {
      name: `${SET_ACTIVE_BLOCK_TYPE} - ENTRY`,
      delta: TIME_DELTA_THRESHOLD,
      slope: SLOPE_THRESHOLD,
    },
  }
}

const insertNewActiveBlock = (state, size) => {
  let _state = state
  const _index = Math.floor(Math.random() * getBlockSize(size))
  const _id = _state.page.blocks[_index]._id
  const _type = _state.blocks[_id].type
  const _refId = _state.blocks[_id].refId
  const _text = entities(_state, _type)[_refId].textValue
  const _insertedBlockId = ObjectId().toHexString()
  _state = reducer(_state, setActiveBlockId(_insertedBlockId))
  const _blockProperties = {
    insertedBlockId: _insertedBlockId,
    insertedBlockText: '',
    previousBlockId: _id,
    previousBlockText: _text,
  }
  _state = reducer(_state, newActiveBlock(_blockProperties))
  return {
    type: {
      name: INSERT_NEW_ACTIVE_BLOCK,
      delta: 65,
      slope: 0.065,
    },
  }
}

const backspaceClearBlock = (state, size) => {
  let _state = state
  const _index = Math.floor(Math.random() * getBlockSize(size))
  const _id = _state.page.blocks[_index]._id
  const _nextBlockId = _state.page.blocks[_index + 2]
    ? _state.page.blocks[_index + 2]._id
    : null
  _state = reducer(_state, setActiveBlockId(_id))

  const _blockProperties = {
    activeBlockId: _id,
    nextBlockId: _nextBlockId,
  }
  _state = reducer(_state, backspace(_blockProperties))

  return {
    type: {
      name: `${BACKSPACE} - CLEAR BLOCK`,
      delta: TIME_DELTA_THRESHOLD,
      slope: 0.025,
    },
  }
}

const onBackspace = (state, size) => {
  let _state = state
  const _index = Math.floor(Math.random() * getBlockSize(size))
  const _id = _state.page.blocks[_index]._id
  const _nextBlockId = _state.page.blocks[_index + 2]
    ? _state.page.blocks[_index + 1]._id
    : null
  _state = reducer(_state, setActiveBlockId(_id))

  const _blockProperties = {
    activeBlockId: _id,
    nextBlockId: _nextBlockId,
  }
  _state = reducer(_state, backspace(_blockProperties))
  return {
    type: {
      name: BACKSPACE,
      delta: TIME_DELTA_THRESHOLD,
      slope: 0.025,
    },
  }
}

const showMenuActionsUI = (state, size) => {
  let _state = state
  const _index = Math.floor(Math.random() * getBlockSize(size))
  const _id = _state.page.blocks[_index]._id
  _state = reducer(_state, setActiveBlockId(_id))
  _state = reducer(_state, onShowMenuActions(true))
  return {
    type: {
      name: SHOW_MENU_ACTIONS,
      delta: TIME_DELTA_THRESHOLD,
      slope: SLOPE_THRESHOLD,
    },
  }
}

const showFormatMenuUI = (state, size) => {
  let _state = state
  const _index = Math.floor(Math.random() * getBlockSize(size))
  const _id = _state.page.blocks[_index]._id
  _state = reducer(_state, setActiveBlockId(_id))
  _state = reducer(_state, onShowFormatMenu(true))
  return {
    type: {
      name: SHOW_FORMAT_MENU,
      delta: TIME_DELTA_THRESHOLD,
      slope: SLOPE_THRESHOLD,
    },
  }
}

const showNewBlockMenu = state => {
  const _state = state
  reducer(_state, newBlockMenu(true))
  return {
    type: {
      name: SHOW_NEW_BLOCK_MENU,
      delta: TIME_DELTA_THRESHOLD,
      slope: SLOPE_THRESHOLD,
    },
  }
}

const onDeleteActiveBlock = (state, size) => {
  let _state = state
  const _index = Math.floor(Math.random() * getBlockSize(size))
  const _id = _state.page.blocks[_index]._id
  _state = reducer(_state, setActiveBlockId(_id))
  _state = reducer(_state, deleteBlock(_id))
  return {
    type: {
      name: `${DELETE_BLOCK} - ACTIVE BLOCK`,
      delta: TIME_DELTA_THRESHOLD,
      slope: 0.025,
    },
  }
}

const onDeleteLastBlock = state => {
  let _state = state
  const _id = _state.page.blocks[_state.page.blocks.length - 1]._id
  _state = reducer(_state, setActiveBlockId(_id))
  _state = reducer(_state, deleteBlock(_id))
  return {
    type: {
      name: `${DELETE_BLOCK} - LAST BLOCK`,
      delta: TIME_DELTA_THRESHOLD,
      slope: 0.025,
    },
  }
}

const deleteBlockList = state => {
  let _state = state
  const _blocks = cloneDeep(_state.page.blocks)
  let _blockList = _blocks.splice(3, 4)
  const _list = _blockList.map(b => b._id)
  _blockList = List(_list)
  _state = reducer(_state, deleteBlocks(_blockList))
  return {
    type: {
      name: DELETE_BLOCKS,
      delta: 35,
      slope: 0.035,
    },
  }
}

const cutBlockList = state => {
  let _state = state
  const _blocks = cloneDeep(_state.page.blocks)
  let _blockList = _blocks.splice(3, 4)
  const _list = _blockList.map(b => b._id)
  _blockList = List(_list)
  const _refId = ObjectId().toHexString()
  const _id = ObjectId().toHexString()
  _state = reducer(_state, cutBlocks(_blockList, _refId, _id))
  return {
    type: {
      name: ON_CUT,
      delta: TIME_DELTA_THRESHOLD,
      slope: 0.035,
    },
  }
}

const onUpdateAtomic = state => {
  let _state = state
  const _refId = Object.keys(_state.sources)[0]
  const _data = {
    atomic: {
      _id: _refId,
      text: {
        textValue: 'New Atomic',
        ranges: [],
      },
    },
    type: 'SOURCE',
  }
  _state = reducer(_state, updateAtomic(_data))
  return {
    type: {
      name: UPDATE_ATOMIC,
      delta: TIME_DELTA_THRESHOLD,
      slope: SLOPE_THRESHOLD,
    },
  }
}

const onDequeuAtomic = state => {
  let _state = state
  const _refId = Object.keys(_state.sources)[0]
  _state.newAtomics = [
    {
      _id: _refId,
      type: 'SOURCE',
      textValue: '',
      ranges: [],
    },
  ]
  _state = reducer(_state, removeAtomicFromQueue(_refId))
  return {
    type: {
      name: DEQUEUE_NEW_ATOMIC,
      delta: TIME_DELTA_THRESHOLD,
      slope: SLOPE_THRESHOLD,
    },
  }
}

const onDirtyAtomic = state => {
  let _state = state
  const _refId = Object.keys(_state.sources)[0]

  _state = reducer(_state, addDirtyAtomic(_refId, 'SOURCE'))
  return {
    type: {
      name: ADD_DIRTY_ATOMIC,
      delta: TIME_DELTA_THRESHOLD,
      slope: SLOPE_THRESHOLD,
    },
  }
}

const onDequeueDirtyAtomic = state => {
  let _state = state
  const _refId = Object.keys(_state.sources)[0]
  _state.dirtyAtomics = { [_refId]: { textValue: '' } }
  _state = reducer(_state, dequeueDirtyAtomic(_refId))
  return {
    type: {
      name: DEQUEUE_DIRTY_ATOMIC,
      delta: TIME_DELTA_THRESHOLD,
      slope: SLOPE_THRESHOLD,
    },
  }
}

const tests = [
  changeBlockContent,
  changeBlockToAtomic,
  changeBlockToEntry,
  insertNewActiveBlock,
  backspaceClearBlock,
  onBackspace,
  showMenuActionsUI,
  showFormatMenuUI,
  onDeleteActiveBlock,
  onDeleteLastBlock,
  deleteBlockList,
  cutBlockList,
  showNewBlockMenu,
  onUpdateAtomic,
  onDequeuAtomic,
  onDirtyAtomic,
  onDequeueDirtyAtomic,
]

// TODO ADD PASTE

describe('Performance Test', () => {
  describe('test process times for actions', () => {
    for (let i = 0; i < tests.length; i += 1) {
      const { averageSlopes, maxDeltas, type } = speedTrap(tests[i])
      test(`${type.name} - delta threshold`, () => {
        const _average = getAvg(maxDeltas)
        expect(Math.round(_average)).toBeLessThanOrEqual(type.delta)
      })
      test(`${type.name} - slope threshold`, () => {
        const _average = getAvg(averageSlopes)
        expect(_average).toBeLessThanOrEqual(type.slope)
      })
    }
  })
})
