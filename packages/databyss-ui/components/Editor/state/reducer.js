import ObjectId from 'bson-objectid'
import cloneDeep from 'clone-deep'

import {
  SET_ACTIVE_BLOCK_ID,
  SET_ACTIVE_BLOCK_CONTENT,
  SET_ACTIVE_BLOCK_TYPE,
  INSERT_BLOCK,
  BACKSPACE,
} from './constants'

export const initialState = {
  activeBlockId: null,
  page: {},
  blocks: {},
  editableState: null,
}

export const getRawHtmlForBlock = (state, block) => {
  switch (block.type) {
    case 'ENTRY':
      return state.entries[block.refId].rawHtml
    case 'SOURCE':
      return state.sources[block.refId].rawHtml
    default:
      throw new Error('Invalid block type', block.type)
  }
}

export const setRawHtmlForBlock = (state, block, html) => {
  const nextState = cloneDeep(state)
  switch (block.type) {
    case 'ENTRY':
      nextState.entries[block.refId].rawHtml = html
      break
    case 'SOURCE':
      nextState.sources[block.refId].rawHtml = html
      break
    default:
      throw new Error('Invalid block type', block.type)
  }
  return nextState
}

const setActiveBlockType = (state, type, isNew, _id) => {
  // changing block type will always generate a new refId
  const nextRefId = ObjectId().toHexString()
  const activeBlock = state.blocks[state.activeBlockId]
  const rawHtml = isNew ? '' : getRawHtmlForBlock(state, activeBlock)
  const nextState = cloneDeep(state)
  nextState.blocks[state.activeBlockId] = {
    ...nextState.blocks[state.activeBlockId],
    _id,
    type,
    refId: nextRefId,
  }
  switch (type) {
    case 'SOURCE':
      nextState.sources[nextRefId] = { _id: nextRefId, rawHtml }
      return nextState
    case 'ENTRY':
      nextState.entries[nextRefId] = { _id: nextRefId, rawHtml }
      return nextState

    default:
      throw new Error('Invalid target block type', type)
  }
}

const insertBlock = (state, payload) => {
  const {
    activeBlockId,
    activeBlockText,
    previousBlockId,
    previousBlockText,
  } = payload.blockProperties

  let _state = state
  _state.page.blocks = [..._state.page.blocks, { _id: state.activeBlockId }]
  _state = setActiveBlockType(_state, 'ENTRY', true, activeBlockId)
  _state = setRawHtmlForBlock(
    _state,
    _state.blocks[activeBlockId],
    activeBlockText
  )
  _state = setRawHtmlForBlock(
    _state,
    _state.blocks[previousBlockId],
    previousBlockText
  )
  return _state
}

const cleanUpState = state => {
  const _state = cloneDeep(state)
  const pageBlocks = _state.page.blocks
  const { blocks, entries, sources } = _state
  const _sources = {}
  const _blocks = {}
  const _entries = {}
  pageBlocks.forEach(b => {
    const { type, refId } = blocks[b._id]
    if (type === 'SOURCE') {
      _sources[refId] = sources[refId]
    }
    if (type === 'ENTRY') {
      _entries[refId] = entries[refId]
    }
    _blocks[b._id] = blocks[b._id]
  })
  _state.blocks = _blocks
  _state.entries = _entries
  _state.sources = _sources
  return _state
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

export default (state, action) => {
  // console.log('nextState', nextState)
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
      // handle edge case: remove all content resets type
      if (!action.payload.html.length) {
        return setActiveBlockType(state, 'ENTRY', true)
      }
      return setRawHtmlForBlock(state, activeBlock, action.payload.html)
    }
    case INSERT_BLOCK:
      return insertBlock(state, action.payload)
    case BACKSPACE:
      return backspace(state, action.payload)
    default:
      return state
  }
}
