import reducer from '../page/reducer'
import {
  setActiveBlockId,
  setActiveBlockContent,
  setActiveBlockType,
  setBlockType,
} from '../page/actions'
import {
  SET_ACTIVE_BLOCK_CONTENT,
  SET_ACTIVE_BLOCK_TYPE,
  SET_ACTIVE_BLOCK_ID,
  SET_BLOCK_TYPE,
} from '../page/constants'
import initialState from './initialState'

describe('editorState', () => {
  describe(SET_ACTIVE_BLOCK_CONTENT, () => {
    test('should set entry content for type ENTRY', () => {
      const state = reducer(
        initialState,
        setActiveBlockId('5d64424bcfa313f70483c1b0')
      )
      const nextState = reducer(state, setActiveBlockContent('updated content'))
      expect(
        nextState.entries[nextState.blocks[nextState.activeBlockId].refId]
          .textValue
      ).toEqual('updated content')
    })
  })
})
