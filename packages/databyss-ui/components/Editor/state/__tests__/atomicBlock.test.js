import reducer, { entities } from '../reducer'

import {
  setActiveBlockId,
  setActiveBlockContent,
  setActiveBlockType,
  setBlockType,
} from '../actions'
import {
  SET_ACTIVE_BLOCK_CONTENT,
  SET_ACTIVE_BLOCK_TYPE,
  SET_ACTIVE_BLOCK_ID,
  SET_BLOCK_TYPE,
} from '../constants'
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
      expect(block.rawHtml).toEqual('topic')
      expect(block.ranges).toEqual([])
    })
  })
})
