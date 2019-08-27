import ObjectId from 'bson-objectid'
import cloneDeep from 'clone-deep'

import {
  SET_ACTIVE_BLOCK_ID,
  SET_ACTIVE_BLOCK_CONTENT,
  SET_ACTIVE_BLOCK_TYPE,
} from './constants'

export const initialState = {
  activeBlockId: null,
  page: {},
  blocks: {},
  draftState: null,
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

const setActiveBlockType = (state, type, isNew) => {
  // changing block type will always generate a new refId
  const nextRefId = ObjectId().toHexString()
  const activeBlock = state.blocks[state.activeBlockId]
  const rawHtml = isNew ? '' : getRawHtmlForBlock(state, activeBlock)
  const nextState = cloneDeep(state)
  nextState.blocks[state.activeBlockId] = {
    ...nextState.blocks[state.activeBlockId],
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
    default:
      return state
  }
}
