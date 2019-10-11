import ObjectId from 'bson-objectid'
import cloneDeep from 'clone-deep'
import invariant from 'invariant'

import { isAtomicInlineType } from './../slate/reducer'

import {
  SET_ACTIVE_BLOCK_ID,
  SET_ACTIVE_BLOCK_CONTENT,
  SET_ACTIVE_BLOCK_TYPE,
  INSERT_NEW_ACTIVE_BLOCK,
  SET_BLOCK_TYPE,
  BACKSPACE,
} from './constants'

export const initialState = {
  activeBlockId: null,
  page: {},
  blocks: {},
  editableState: null,
}

export const entities = (state, type) =>
  ({
    ENTRY: state.entries,
    LOCATION: state.locations,
    SOURCE: state.sources,
    TOPIC: state.topics,
  }[type])

const cleanUpState = state => {
  let _state = cloneDeep(state)
  const pageBlocks = _state.page.blocks
  const _blocks = _state.blocks

  const newState = {
    entries: {},
    sources: {},
    topics: {},
    blocks: {},
    locations: {},
  }

  pageBlocks.forEach(b => {
    const { type, refId } = _blocks[b._id]
    entities(newState, type)[refId] = entities(state, type)[refId]
    newState.blocks[b._id] = _blocks[b._id]
  })

  _state = { ..._state, ...newState }
  return _state
}

export const getRawHtmlForBlock = (state, block) =>
  entities(state, block.type)[block.refId].rawHtml

export const setRawHtmlForBlock = (state, block, html) => {
  const nextState = cloneDeep(state)

  switch (block.type) {
    case 'ENTRY':
      nextState.entries[block.refId].rawHtml = html
      break
    case 'SOURCE':
      nextState.sources[block.refId].rawHtml = html
      break
    case 'LOCATION':
      nextState.locations[block.refId].rawHtml = html
      break
    case 'TOPIC':
      nextState.topics[block.refId].rawHtml = html
      break
    default:
      throw new Error('Invalid block type', block.type)
  }
  return nextState
}

export const getBlockRefEntity = (state, block) =>
  entities(state, block.type)[block.refId]

export const correctRangeOffsetForBlock = (state, block, offset) => {
  const _state = cloneDeep(state)
  getBlockRefEntity(_state, block).ranges = getBlockRefEntity(
    _state,
    block
  ).ranges.map(r => ({ ...r, offset: r.offset + offset }))
  return _state
}

export const getRangesForBlock = (state, block) => {
  switch (block.type) {
    case 'ENTRY':
      return state.entries[block.refId].ranges
    case 'SOURCE':
      return state.sources[block.refId].ranges
    case 'LOCATION':
      return state.locations[block.refId].ranges
    case 'TOPIC':
      return state.topics[block.refId].ranges
    default:
      throw new Error('Invalid block type', block.type)
  }
}

export const setRangesForBlock = (state, block, ranges) => {
  const nextState = cloneDeep(state)
  entities(nextState, block.type)[block.refId].ranges = ranges
  return nextState
}

const setBlockType = (state, type, _id) => {
  // changing block type will always generate a new refId
  const nextRefId = ObjectId().toHexString()
  const block = state.blocks[_id]
  const rawHtml = block ? getRawHtmlForBlock(state, block) : ''
  // initialize range
  const ranges = block ? getRangesForBlock(state, block) : []

  const nextState = cloneDeep(state)
  nextState.blocks[_id] = {
    ...nextState.blocks[_id],
    _id,
    type,
    refId: nextRefId,
  }

  switch (type) {
    case 'SOURCE':
      nextState.sources[nextRefId] = { _id: nextRefId, rawHtml, ranges }
      return nextState
    case 'ENTRY':
      nextState.entries[nextRefId] = { _id: nextRefId, rawHtml, ranges }
      return nextState
    case 'LOCATION':
      nextState.locations[nextRefId] = { _id: nextRefId, rawHtml, ranges }
      return nextState
    case 'TOPIC':
      nextState.topics[nextRefId] = { _id: nextRefId, rawHtml, ranges }
      return nextState

    default:
      throw new Error('Invalid target block type', type)
  }
}

const setActiveBlockType = (state, type) =>
  setBlockType(state, type, state.activeBlockId)

const insertNewActiveBlock = (
  state,
  { insertedBlockId, insertedBlockText, previousBlockId, previousBlockText }
) => {
  invariant(
    insertedBlockId === state.activeBlockId,
    'insertedBlockId must match activeBlockId. It is possible that you called insertNewActiveBlock before activeBlockId was updated'
  )

  let insertedBlockType = 'ENTRY'
  let insertedText = insertedBlockText
  let _ranges = []
  let _state = cloneDeep(state)

  // get index value where previous block was
  // insert current ID after previous index value
  const _index = _state.page.blocks.findIndex(b => b._id === previousBlockId)
  _state.page.blocks.splice(_index + 1, 0, { _id: insertedBlockId })

  // if previous block was atomic type and is now empty
  // set previous block to ENTRY and active block as SOURCE

  if (
    isAtomicInlineType(state.blocks[previousBlockId].type) &&
    !previousBlockText
  ) {
    _state = setBlockType(_state, 'ENTRY', previousBlockId)
    insertedBlockType = state.blocks[previousBlockId].type
    // get atomic block text and ranges to transfer to new block
    const { rawHtml, ranges } = entities(_state, 'ENTRY')[
      _state.blocks[previousBlockId].refId
    ]
    insertedText = rawHtml
    _ranges = ranges
  }

  if (state.blocks[previousBlockId].type === 'LOCATION') {
    // if new block is added before LOCATION type
    if (!previousBlockText) {
      _state = setBlockType(_state, 'ENTRY', previousBlockId)
      insertedBlockType = state.blocks[previousBlockId].type
      const { rawHtml, ranges } = entities(_state, 'ENTRY')[
        _state.blocks[previousBlockId].refId
      ]
      insertedText = rawHtml
      _ranges = ranges
    }
    // if enter is pressed in the middle of a location
    if (previousBlockText && insertedBlockText) {
      insertedBlockType = 'LOCATION'
    }
  }

  _state = setBlockType(_state, insertedBlockType, insertedBlockId)

  _state = setRawHtmlForBlock(
    _state,
    _state.blocks[insertedBlockId],
    insertedText
  )

  _state = setRangesForBlock(_state, _state.blocks[insertedBlockId], _ranges)

  // prevent html elements in rawText from atomic types
  const previousText = isAtomicInlineType(_state.blocks[previousBlockId].type)
    ? getRawHtmlForBlock(_state, _state.blocks[previousBlockId])
    : previousBlockText

  _state = setRawHtmlForBlock(
    _state,
    _state.blocks[previousBlockId],
    previousText
  )

  return cleanUpState(_state)
}

const backspace = (state, payload) => {
  const { activeBlockId, nextBlockId } = payload.blockProperties
  const _state = state
  const _blocks = _state.page.blocks
  const activeBlockIndex = _blocks.findIndex(b => b._id === activeBlockId)
  if (!nextBlockId) {
    // current block should be the last block
    if (_blocks.length === activeBlockIndex + 1) {
      return cleanUpState(_state)
    }
    _blocks.splice(activeBlockIndex + 1, 1)
  }
  const nextBlockIndex = _blocks.findIndex(b => b._id === nextBlockId)
  // next block index should correspond to page index
  if (activeBlockIndex + 1 === nextBlockIndex) {
    return cleanUpState(_state)
  }
  _blocks.splice(activeBlockIndex + 1, 1)
  return cleanUpState(_state)
}

const getMarkupValues = (nextState, ranges) => {
  const block = nextState.blocks[nextState.activeBlockId]
  const _state = cloneDeep(nextState)
  switch (block.type) {
    case 'ENTRY':
      _state.entries[block.refId] = {
        ..._state.entries[block.refId],
        ranges,
      }
      break
    case 'SOURCE':
      _state.entries[block.refId] = {
        ..._state.sources[block.refId],
        ranges,
      }
      break
    case 'TOPIC':
      _state.entries[block.refId] = {
        ..._state.topics[block.refId],
        ranges,
      }
      break
    default:
      break
  }

  return _state
}

export default (state, action) => {
  switch (action.type) {
    case SET_ACTIVE_BLOCK_TYPE:
      return setActiveBlockType(state, action.payload.type)
    case SET_ACTIVE_BLOCK_ID:
      return {
        ...state,
        activeBlockId: action.payload.id,
      }
    case SET_ACTIVE_BLOCK_CONTENT: {
      const activeBlock = state.blocks[state.activeBlockId]
      if (
        isAtomicInlineType(activeBlock.type) &&
        action.payload.html.length !== 0
      )
        return state
      let nextState = setRawHtmlForBlock(
        state,
        activeBlock,
        action.payload.html
      )
      if (action.payload.ranges) {
        nextState = getMarkupValues(nextState, action.payload.ranges)
      }
      if (!action.payload.html.length) {
        return setActiveBlockType(nextState, 'ENTRY')
      }
      return nextState
    }
    case INSERT_NEW_ACTIVE_BLOCK:
      return insertNewActiveBlock(state, action.payload.blockProperties)
    case BACKSPACE:
      return backspace(state, action.payload)
    case SET_BLOCK_TYPE:
      let nextState = cloneDeep(state)
      const _html = getRawHtmlForBlock(
        nextState,
        nextState.blocks[action.payload.id]
      )
      if (_html.startsWith('@') || _html.startsWith('#')) {
        nextState = setRawHtmlForBlock(
          nextState,
          nextState.blocks[action.payload.id],
          _html.substring(1)
        )

        // correct range offset
        nextState = correctRangeOffsetForBlock(
          nextState,
          nextState.blocks[action.payload.id],
          -1
        )
      }
      return setBlockType(nextState, action.payload.type, action.payload.id)
    default:
      return state
  }
}
