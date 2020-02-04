import regression from 'regression'
import ObjectId from 'bson-objectid'

import reducer, { entities } from '../page/reducer'
import {
  setActiveBlockId,
  setActiveBlockContent,
  setActiveBlockType,
  newActiveBlock,
  backspace,
} from '../page/actions'
import { generateState, getBlockSize, SMALL, MED, LARGE } from './_helpers'

const TIME_DELTA_THRESHOLD = 50
const SAMPLE_SIZE = 1
const SLOPE_THRESHOLD = 0.1
// const NS_PER_SEC = 1e9

function getAvg(threshold) {
  const total = threshold.reduce((acc, c) => acc + c, 0)
  return parseFloat(total / threshold.length)
}

/*
takes in a (state, , type, size) => {
  processes reducerFunctions
  returns {maxDelta: Array, averageSlope: Array}
}
*/
export const speedTrap = reducerFunctions => {
  const _size = [SMALL, MED, LARGE]
  // const _size = [SMALL]

  const slopes = []
  const maxDeltas = []
  let _type
  for (let i = 0; i < SAMPLE_SIZE; i += 1) {
    const deltas = []
    _size.forEach(size => {
      const _state = generateState(size)
      // const time = process.hrtime()
      const time = performance.now()
      const { type } = reducerFunctions(_state, size)
      _type = type
      const diff = performance.now() - time
      // let diff = process.hrtime(time)
      // diff = diff[0] * NS_PER_SEC + diff[1] / NS_PER_SEC
      deltas.push(diff)
      if (size === LARGE) {
        maxDeltas.push(diff)
      }
    })
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
  return { type: 'CHANGE CONTENT' }
}

const changeBlockToAtomic = (state, size) => {
  let _state = state
  const _index = Math.floor(Math.random() * getBlockSize(size))
  const _id = _state.page.blocks[_index]._id
  _state = reducer(_state, setActiveBlockId(_id))
  _state = reducer(_state, setActiveBlockType('SOURCE'))
  return { type: 'CHANGE BLOCK TYPE TO ATOMIC' }
}

const changeBlockToEntry = (state, size) => {
  let _state = state
  const _index = Math.floor(Math.random() * getBlockSize(size))
  const _id = _state.page.blocks[_index]._id
  _state = reducer(_state, setActiveBlockId(_id))
  _state = reducer(_state, setActiveBlockType('ENTRY'))
  return { type: 'CHANGE BLOCK TYPE TO ENTRY' }
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
  return { type: 'INSERT NEW ACTIVE BLOCK' }
}

const onBackspace = (state, size) => {
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

  return { type: 'CLEARS BLOCK ON BACKSPACE' }
}

const tests = [
  changeBlockContent,
  changeBlockToAtomic,
  changeBlockToEntry,
  insertNewActiveBlock,
  onBackspace,
]

describe('Performance Test', () => {
  describe('test process times for actions', () => {
    for (let i = 0; i < tests.length; i += 1) {
      const { averageSlopes, maxDeltas, type } = speedTrap(tests[i])
      test(`${type} - delta threshold`, () => {
        const _average = getAvg(maxDeltas)
        expect(Math.round(_average)).toBeLessThanOrEqual(TIME_DELTA_THRESHOLD)
      })
      test(`${type} - slope threshold`, () => {
        const _average = getAvg(averageSlopes)
        expect(_average).toBeLessThanOrEqual(SLOPE_THRESHOLD)
      })
    }
  })
})
