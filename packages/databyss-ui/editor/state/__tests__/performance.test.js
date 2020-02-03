import regression from 'regression'
import reducer from '../page/reducer'
import { setActiveBlockId, setActiveBlockContent } from '../page/actions'
import { SET_ACTIVE_BLOCK_CONTENT } from '../page/constants'
import {
  generateState,
  getBlockSize,
  SMALL,
  MED,
  LARGE,
} from './testStateBuildier'

const THRESHOLD = 2
const SAMPLE_SIZE = 20
const SLOPE_THRESHOLD = 0

function getAvg(threshold) {
  const total = threshold.reduce((acc, c) => acc + c, 0)
  return parseFloat(total / threshold.length)
}

describe('Performance Test', () => {
  describe(SET_ACTIVE_BLOCK_CONTENT, () => {
    const _size = [SMALL, MED, LARGE]
    const results = []
    _size.forEach(size => {
      const _threshold = []
      for (let i = 0; i < SAMPLE_SIZE; i += 1) {
        let _state = generateState(size)
        const _firstId = _state.page.blocks[0]._id
        let time = Date.now()
        _state = reducer(_state, setActiveBlockId(_firstId))
        _state = reducer(_state, setActiveBlockContent('updated content'))
        time = Date.now() - time
        _threshold.push(time)
        results.push([getBlockSize(size), time])
      }
      if (size === LARGE) {
        test('should test threshold for large sample size', () => {
          const _average = getAvg(_threshold)
          expect(Math.round(_average)).toBeLessThanOrEqual(THRESHOLD)
        })
      }
    })
    test('should have a slope threshold equal or less than 0', () => {
      const slope = regression.linear(results).equation[0]
      expect(slope).toBeLessThanOrEqual(SLOPE_THRESHOLD)
    })
  })
})
