import regression from 'regression'
import reducer from '../page/reducer'
import { setActiveBlockId, setActiveBlockContent } from '../page/actions'
import { SET_ACTIVE_BLOCK_CONTENT } from '../page/constants'
import { generateState, getBlockSize, SMALL, MED, LARGE } from './_helpers'

const THRESHOLD = 1
const SAMPLE_SIZE = 10
const SLOPE_THRESHOLD = 0
const NS_PER_SEC = 1e9

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
  const slopes = []
  const maxDeltas = []
  let _type
  for (let i = 0; i < SAMPLE_SIZE; i += 1) {
    const deltas = []
    _size.forEach(size => {
      let _state = generateState(size)
      const time = process.hrtime()
      const { type } = reducerFunctions(_state, size)
      _type = type
      let diff = process.hrtime(time)
      diff = diff[0] * NS_PER_SEC + diff[1] / NS_PER_SEC
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

const changeBlockContent = (state, size) => {
  let _state = state
  const _index = Math.floor(Math.random() * getBlockSize(size))
  const _id = _state.page.blocks[_index]._id
  _state = reducer(_state, setActiveBlockId(_id))
  _state = reducer(_state, setActiveBlockContent('updated content'))
  return { type: 'CHANGE CONTENT' }
}

const functionArray = [changeBlockContent]

describe('Performance Test', () => {
  describe(SET_ACTIVE_BLOCK_CONTENT, () => {
    const { averageSlopes, maxDeltas, type } = speedTrap(changeBlockContent)

    console.log('logs tests type', type)
    // create array of functions with tests

    test('should test threshold for large sample size', () => {
      const _average = getAvg(maxDeltas)
      expect(Math.round(_average)).toBeLessThanOrEqual(THRESHOLD)
    })
    test('should have a slope threshold less than ', () => {
      const _average = getAvg(averageSlopes)
      expect(_average).toBeLessThanOrEqual(SLOPE_THRESHOLD)
    })
  })
})
