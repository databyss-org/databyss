import reducer, { entities } from '../page/reducer'

import { setActiveBlockId, setActiveBlockContent } from '../page/actions'
import { SET_ACTIVE_BLOCK_CONTENT } from '../page/constants'
import initialState from './initialState'

describe('atomic Blocks', () => {
  describe(SET_ACTIVE_BLOCK_CONTENT, () => {
    test('should not allow atomic blocks to be edited', () => {
      const state = reducer(
        initialState,
        setActiveBlockId('5d7bbf85b5bf4165a5826720')
      )
      const nextState = reducer(
        state,
        setActiveBlockContent('other', {}, [
          {
            offset: 0,
            length: 7,
            marks: ['bold'],
          },
        ])
      )
      const block = entities(
        nextState,
        nextState.blocks[nextState.activeBlockId].type
      )[nextState.blocks[nextState.activeBlockId].refId]
      expect(block.textValue).toEqual('topic')
      expect(block.ranges).toEqual([])
    })
  })
})
