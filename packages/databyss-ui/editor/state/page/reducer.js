import ObjectId from 'bson-objectid'
import cloneDeep from 'clone-deep'
import invariant from 'invariant'

import { isAtomicInlineType } from './../../slate/page/reducer'

import {
  SET_ACTIVE_BLOCK_ID,
  SET_ACTIVE_BLOCK_CONTENT,
  SET_ACTIVE_BLOCK_TYPE,
  INSERT_NEW_ACTIVE_BLOCK,
  SET_BLOCK_TYPE,
  BACKSPACE,
  DELETE_BLOCK,
  DELETE_BLOCKS,
  SHOW_MENU_ACTIONS,
  SHOW_FORMAT_MENU,
  ON_PASTE,
  SHOW_NEW_BLOCK_MENU,
  UPDATE_SOURCE,
  DEQUEUE_NEW_SOURCE,
} from './constants'

export initialState from './../initialState'

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

export const getRawHtmlForBlock = (state, block) => {
  if (entities(state, block.type)[block.refId]) {
    return entities(state, block.type)[block.refId].textValue
  }
  return null
}

export const setRawHtmlForBlock = (state, block, text) => {
  const nextState = cloneDeep(state)

  switch (block.type) {
    case 'ENTRY':
      nextState.entries[block.refId].textValue = text
      break
    case 'SOURCE':
      nextState.sources[block.refId].textValue = text
      break
    case 'LOCATION':
      nextState.locations[block.refId].textValue = text
      break
    case 'TOPIC':
      nextState.topics[block.refId].textValue = text
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

// If refId is passed, function will preserve the ID
const setBlockType = (state, type, _id, refId) => {
  const _refId = state.blocks[_id] ? state.blocks[_id].refId : refId

  // if it is type atomic, preserve the ID
  const nextRefId =
    (state.blocks[_id] && isAtomicInlineType(type)) || refId
      ? _refId
      : ObjectId().toHexString()

  const block = state.blocks[_id]
  const textValue = block ? getRawHtmlForBlock(state, block) : ''
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
      const _source = { _id: nextRefId, textValue, ranges }
      nextState.sources[nextRefId] = _source
      if (nextState.newSources) {
        nextState.newSources.push(_source)
      } else {
        nextState.newSources = [_source]
      }
      return nextState
    case 'ENTRY':
      nextState.entries[nextRefId] = { _id: nextRefId, textValue, ranges }
      return nextState
    case 'LOCATION':
      nextState.locations[nextRefId] = { _id: nextRefId, textValue, ranges }
      return nextState
    case 'TOPIC':
      nextState.topics[nextRefId] = { _id: nextRefId, textValue, ranges }
      return nextState

    default:
      throw new Error('Invalid target block type', type)
  }
}

const setActiveBlockType = (state, type, refId) =>
  setBlockType(state, type, state.activeBlockId, refId)

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
  let _refId = null

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
    // get refId from previous block to apply to atomic block
    _refId = _state.blocks[previousBlockId].refId
    _state = setBlockType(_state, 'ENTRY', previousBlockId)
    insertedBlockType = state.blocks[previousBlockId].type
    // get atomic block text and ranges to transfer to new block
    const { textValue, ranges } = entities(_state, 'ENTRY')[
      _state.blocks[previousBlockId].refId
    ]
    insertedText = textValue
    _ranges = ranges
  }

  if (state.blocks[previousBlockId].type === 'LOCATION') {
    // if new block is added before LOCATION type
    if (!previousBlockText) {
      _state = setBlockType(_state, 'ENTRY', previousBlockId)
      insertedBlockType = state.blocks[previousBlockId].type
      const { textValue, ranges } = entities(_state, 'ENTRY')[
        _state.blocks[previousBlockId].refId
      ]
      insertedText = textValue
      _ranges = ranges
    }
    // if enter is pressed in the middle of a location
    if (previousBlockText && insertedBlockText) {
      insertedBlockType = 'LOCATION'
    }
  }
  _state = setBlockType(_state, insertedBlockType, insertedBlockId, _refId)

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
  const _state = cloneDeep(state)
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

const updateSource = (state, source) => {
  const _state = cloneDeep(state)
  _state.sources[source._id] = {
    ranges: source.text.ranges,
    textValue: source.text.textValue,
  }
  return _state
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

const deleteBlock = (state, payload) => {
  const _state = cloneDeep(state)
  _state.page.blocks = _state.page.blocks.filter(v => v._id !== payload.id)
  return cleanUpState(_state)
}
const deleteBlocks = (state, payload) => {
  const _state = cloneDeep(state)

  _state.page.blocks = _state.page.blocks.filter(
    v => !payload.idList.includes(v._id)
  )
  // if first block was included, replace with id
  if (state.page.blocks.findIndex(i => i._id === payload.idList.get(0)) === 0) {
    const firstBlock = { _id: payload.idList.get(0) }
    _state.page.blocks.splice(0, 0, firstBlock)
  }
  return cleanUpState(_state)
}

const onPaste = (state, anchorKey, list, offset, newId) => {
  let _text
  const _list = cloneDeep(list)
  const _state = cloneDeep(state)
  let _index = _state.page.blocks.findIndex(i => i._id === anchorKey)

  const { blocks } = _state

  // get current block contents
  const { type, refId } = blocks[anchorKey]
  const _entity = entities(state, type)[refId]

  const _firstPasteFrag = _list[0][Object.keys(_list[0])[0]]
  const _lastPasteFrag =
    _list[_list.length - 1][Object.keys(_list[_list.length - 1])[0]]

  if (_entity.textValue.length !== 0) {
    // check if first paste fragment is not atomic
    if (!isAtomicInlineType(_firstPasteFrag.type)) {
      const _oldRefId = Object.keys(_list[0])[0]
      // block value to be merged with anchorBlock
      const _anchorBlock = _list[0][_oldRefId]

      if (_entity.textValue.length === offset) {
        // if paste occurs at the end of a block
        _text = _entity.textValue + _anchorBlock.text
      } else {
        // split first block where paste occured
        let _firstText = _entity.textValue.split('')
        const _lastText = _firstText.splice(offset).join('')
        _firstText = _firstText.join('')
        _text = _firstText + _anchorBlock.text

        if (!isAtomicInlineType(_lastPasteFrag.type)) {
          // if last paste block is not atomic append text to last block
          _list[_list.length - 1][_lastPasteFrag._id].text =
            _list[_list.length - 1][_lastPasteFrag._id].text + _lastText
        } else {
          // TODO:
          // if last paste block is atomic create a new block for last text
        }
      }
      // TODO: MERGE BOTH RANGES

      const _newEntity = {
        textValue: _text,
        _id: _entity._id,
        ranges: _entity.ranges,
      }
      // append merged anchor block
      entities(_state, type)[refId] = _newEntity
      // remove first list item
      _list.shift()
      _index += _index
    } else {
      // TODO: WRITE TESTS TO COVER BOTH THESE CASES
      // CASE 1: PASTE ON END OF ENTRY WITH FIRST BLOCK ATOMIC
      // CASE 2: SAME AS CASE 1 BUT IN THE MIDDLE OF A PAGE

      /*
       if first block in paste is atomic on an existing line
       find offset where to add empty block
       initialize empty block with first Id value
       */
      _index += _index
      const _firstPasteFrag = _list[0][Object.keys(_list[0])]
      // add empty block to pages list
      _state.page.blocks.splice(_index, 0, { _id: _firstPasteFrag._id })
      /* if last paste fragment is not atomic merge second half of entry with the end of paste fragment */
      if (_entity.textValue.length !== offset) {
        if (!isAtomicInlineType(_lastPasteFrag.type)) {
          const _lastText = _entity.textValue
            .split('')
            .splice(offset)
            .join('')

          _list[_list.length - 1][_lastPasteFrag._id].text =
            _list[_list.length - 1][_lastPasteFrag._id].text + _lastText

          // TODO: MERGE RANGES
        } else {
          /* if last block is atomic and pasted in the middle of an entry, create a new block for last fragment */
          const _block = _state.blocks[anchorKey]
          const _entity = entities(_state, _block.type)[_block.refId]
          // split the text
          let _first = _entity.textValue.split('')
          const _last = _first.splice(offset).join('')
          _first = _first.join('')
          // replace first half of text
          entities(_state, _block.type)[_block.refId] = {
            _id: _block.refId,
            ranges: _block.ranges,
            textValue: _first,
          }

          // append new block to list with second half of text
          const _newBlock = {
            [newId]: {
              text: _last,
              type: 'ENTRY',
              ranges: [],
              refId: ObjectId().toHexString(),
              _id: newId,
            },
          }
          _list.push(_newBlock)
        }
      }
    }
  }
  /* if contents of current block are empty, slate will create a new block id, replace the the block id with the first block in the list
   */

  const _pagesList = _list.map(b => ({ _id: b[Object.keys(b)[0]]._id }))

  const _blocks = {}
  _list.forEach(b => {
    // populate blocks
    const _block = b[Object.keys(b)[0]]
    _blocks[_block._id] = {
      _id: _block._id,
      refId: _block.refId,
      type: _block.type,
    }

    // populate entities
    entities(_state, _block.type)[_block.refId] = {
      _id: _block.refId,
      ranges: _block.ranges,
      textValue: _block.text,
    }
  })
  _state.blocks = Object.assign({}, _state.blocks, _blocks)
  // inserted blocks added to pages block list
  if (_pagesList.length > 0) {
    _state.page.blocks.splice(_index, 1, ..._pagesList)
  }

  /*
    slate will insert the text at selected offset 
    */

  return cleanUpState(_state)
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
    case SHOW_MENU_ACTIONS:
      return {
        ...state,
        showMenuActions: action.payload.bool,
      }
    case ON_PASTE:
      return onPaste(
        state,
        action.payload.key,
        action.payload.list,
        action.payload.offset,
        action.payload.newId
      )
    case SHOW_NEW_BLOCK_MENU:
      return {
        ...state,
        showNewBlockMenu: action.payload.bool,
      }
    case SHOW_FORMAT_MENU:
      return {
        ...state,
        showFormatMenu: action.payload.bool,
      }
    case UPDATE_SOURCE: {
      return updateSource(state, action.payload.source)
    }
    case SET_ACTIVE_BLOCK_CONTENT: {
      const activeBlock = state.blocks[state.activeBlockId]
      if (
        isAtomicInlineType(activeBlock.type) &&
        action.payload.html.length !== 0
      ) {
        return state
      }
      let nextState = setRawHtmlForBlock(
        state,
        activeBlock,
        action.payload.html
      )
      if (action.payload.ranges) {
        nextState = getMarkupValues(nextState, action.payload.ranges)
      }
      // if length is empty, set blocktype to entry
      // preserve refId
      if (!action.payload.html.length) {
        let _refId = null
        if (nextState.blocks[nextState.activeBlockId]) {
          const { type, refId } = nextState.blocks[nextState.activeBlockId]
          _refId = isAtomicInlineType(type) ? refId : null
        }
        // if refID gets passed, preserve the refID
        return setActiveBlockType(nextState, 'ENTRY', _refId)
      }
      return nextState
    }
    case INSERT_NEW_ACTIVE_BLOCK:
      return insertNewActiveBlock(state, action.payload.blockProperties)
    case BACKSPACE:
      return backspace(state, action.payload)
    case DELETE_BLOCK:
      return deleteBlock(state, action.payload)
    case DELETE_BLOCKS:
      return deleteBlocks(state, action.payload)
    case SET_BLOCK_TYPE:
      let nextState = cloneDeep(state)
      const _html = getRawHtmlForBlock(
        nextState,
        nextState.blocks[action.payload.id]
      )
      if (_html.trim().startsWith('@') || _html.trim().startsWith('#')) {
        nextState = setRawHtmlForBlock(
          nextState,
          nextState.blocks[action.payload.id],
          _html
            .trim()
            .substring(1)
            .trim()
        )

        // correct range offset
        nextState = correctRangeOffsetForBlock(
          nextState,
          nextState.blocks[action.payload.id],
          -1
        )
      }
      return setBlockType(nextState, action.payload.type, action.payload.id)
    case DEQUEUE_NEW_SOURCE:
      let _que = state.newSources
      const _id = action.payload.id
      _que = _que.filter(q => q._id !== _id)
      return { ...state, newSources: _que }
    default:
      return state
  }
}
