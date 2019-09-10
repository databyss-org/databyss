import reducer from '../reducer'
import {
  setActiveBlockId,
  setActiveBlockContent,
  setActiveBlockType,
} from '../actions'
import {
  SET_ACTIVE_BLOCK_CONTENT,
  SET_ACTIVE_BLOCK_TYPE,
  SET_ACTIVE_BLOCK_ID,
} from '../constants'
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
          .rawHtml
      ).toEqual('updated content')
    })

    test('should set source content for type SOURCE', () => {
      const state = reducer(
        initialState,
        setActiveBlockId('5d64423aae2da21680dc208b')
      )
      const nextState = reducer(state, setActiveBlockContent('updated content'))
      expect(
        nextState.sources[nextState.blocks[nextState.activeBlockId].refId]
          .rawHtml
      ).toEqual('updated content')
    })
    test('clearing content should reset type to ENTRY', () => {
      const state = reducer(
        initialState,
        setActiveBlockId('5d64423aae2da21680dc208b')
      )
      const nextState = reducer(state, setActiveBlockContent(''))
      expect(nextState.blocks[nextState.activeBlockId].type).toEqual('ENTRY')
    })
  })

  describe(SET_ACTIVE_BLOCK_TYPE, () => {
    test('should change block type from ENTRY to SOURCE', () => {
      const state = reducer(
        initialState,
        setActiveBlockId('5d64424bcfa313f70483c1b0')
      )
      const nextState = reducer(state, setActiveBlockType('SOURCE'))
      expect(nextState.blocks[nextState.activeBlockId].type).toEqual('SOURCE')
    })
    test('should create a new refId', () => {
      const state = reducer(
        initialState,
        setActiveBlockId('5d64424bcfa313f70483c1b0')
      )
      const prevRefId = state.blocks[state.activeBlockId].refId
      const nextState = reducer(state, setActiveBlockType('SOURCE'))
      const nextRefId = nextState.blocks[state.activeBlockId].refId
      expect(nextRefId).not.toEqual(prevRefId)
    })
    test('should create a SOURCE record with new refId', () => {
      const state = reducer(
        initialState,
        setActiveBlockId('5d64424bcfa313f70483c1b0')
      )
      const nextState = reducer(state, setActiveBlockType('SOURCE'))
      const block = nextState.blocks[nextState.activeBlockId]
      const source = nextState.sources[block.refId]
      expect(source.rawHtml).toEqual(
        'On the limitation of third-order thought to assertion'
      )
    })
  })

  describe(SET_ACTIVE_BLOCK_ID, () => {
    test('should update activeBlockId', () => {
      const state = reducer(
        initialState,
        setActiveBlockId('5d64424bcfa313f70483c1b0')
      )
      expect(state.activeBlockId).toEqual('5d64424bcfa313f70483c1b0')
    })
  })
})
