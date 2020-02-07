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
    test('should not set source content for type SOURCE (atomic)', () => {
      const state = reducer(
        initialState,
        setActiveBlockId('5d64423aae2da21680dc208b')
      )
      const nextState = reducer(state, setActiveBlockContent('updated content'))
      expect(
        nextState.sources[nextState.blocks[nextState.activeBlockId].refId]
          .textValue
      ).toEqual(
        'Stamenov, Language Structure, Discourse and the Access to Consciousness'
      )
    })
    test('clearing content should reset type to ENTRY', () => {
      const state = reducer(
        initialState,
        setActiveBlockId('5d64423aae2da21680dc208b')
      )
      const nextState = reducer(state, setActiveBlockContent(''))
      expect(nextState.blocks[nextState.activeBlockId].type).toEqual('ENTRY')
    })

    test('should not set source content for type TOPIC (atomic)', () => {
      const state = reducer(
        initialState,
        setActiveBlockId('5d7bbf85b5bf4165a5826720')
      )
      const nextState = reducer(state, setActiveBlockContent('updated content'))
      expect(
        nextState.topics[nextState.blocks[nextState.activeBlockId].refId]
          .textValue
      ).toEqual('topic')
    })
    test('clearing content should reset type to ENTRY', () => {
      const state = reducer(
        initialState,
        setActiveBlockId('5d7bbf85b5bf4165a5826720')
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
    test('should not create a new refId', () => {
      const state = reducer(
        initialState,
        setActiveBlockId('5d64424bcfa313f70483c1b0')
      )
      const prevRefId = state.blocks[state.activeBlockId].refId
      const nextState = reducer(state, setActiveBlockType('SOURCE'))
      const nextRefId = nextState.blocks[state.activeBlockId].refId
      expect(nextRefId).toEqual(prevRefId)
    })
    test('should create a SOURCE record with new refId', () => {
      const state = reducer(
        initialState,
        setActiveBlockId('5d64424bcfa313f70483c1b0')
      )
      const nextState = reducer(state, setActiveBlockType('SOURCE'))
      const block = nextState.blocks[nextState.activeBlockId]
      const source = nextState.sources[block.refId]
      expect(source.textValue).toEqual(
        'On the limitation of third-order thought to assertion'
      )
    })
  })

  describe(SET_BLOCK_TYPE, () => {
    test('should change block type from ENTRY to SOURCE', () => {
      const state = reducer(
        initialState,
        setActiveBlockId('5d64423aae2da21680dc208b')
      )
      const blockId = '5d64424bcfa313f70483c1b0'
      const nextState = reducer(state, setBlockType('SOURCE', blockId))
      expect(nextState.blocks[blockId].type).toEqual('SOURCE')
    })
    test('should remove leading @', () => {
      const blockId = '5d64424bcfa313f70483c1b0'
      const state = reducer(initialState, setActiveBlockId(blockId))
      let nextState = reducer(
        state,
        setActiveBlockContent('@this should become a source')
      )
      nextState = reducer(
        nextState,
        setBlockType('SOURCE', blockId, null, true)
      )
      expect(
        nextState.sources[nextState.blocks[nextState.activeBlockId].refId]
          .textValue
      ).toEqual('this should become a source')
    })
  })

  describe(SET_ACTIVE_BLOCK_TYPE, () => {
    test('should change block type from ENTRY to TOPIC', () => {
      const state = reducer(
        initialState,
        setActiveBlockId('5d7bbf85b5bf4165a5826720')
      )
      const nextState = reducer(state, setActiveBlockType('TOPIC'))
      expect(nextState.blocks[nextState.activeBlockId].type).toEqual('TOPIC')
    })
    test('should not create a new refId', () => {
      const state = reducer(
        initialState,
        setActiveBlockId('5d7bbf85b5bf4165a5826720')
      )
      const prevRefId = state.blocks[state.activeBlockId].refId
      const nextState = reducer(state, setActiveBlockType('TOPIC'))
      const nextRefId = nextState.blocks[state.activeBlockId].refId
      expect(nextRefId).toEqual(prevRefId)
    })
    test('should create a TOPIC record with new refId', () => {
      const state = reducer(
        initialState,
        setActiveBlockId('5d7bbf85b5bf4165a5826720')
      )
      const nextState = reducer(state, setActiveBlockType('TOPIC'))
      const block = nextState.blocks[nextState.activeBlockId]
      const topic = nextState.topics[block.refId]
      expect(topic.textValue).toEqual('topic')
    })
  })

  describe(SET_BLOCK_TYPE, () => {
    test('should change block type from ENTRY to TOPIC', () => {
      const state = reducer(
        initialState,
        setActiveBlockId('5d7bbf85b5bf4165a5826720')
      )
      const blockId = '5d64424bcfa313f70483c1b0'
      const nextState = reducer(state, setBlockType('TOPIC', blockId))
      expect(nextState.blocks[blockId].type).toEqual('TOPIC')
    })
    test('should remove leading #', () => {
      const blockId = '5d64424bcfa313f70483c1b0'
      const state = reducer(initialState, setActiveBlockId(blockId))
      let nextState = reducer(
        state,
        setActiveBlockContent('#this should become a topic')
      )
      nextState = reducer(nextState, setBlockType('TOPIC', blockId, null, true))
      expect(
        nextState.topics[nextState.blocks[nextState.activeBlockId].refId]
          .textValue
      ).toEqual('this should become a topic')
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
