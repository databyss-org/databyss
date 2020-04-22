import ObjectId from 'bson-objectid'
import { produce } from 'immer'
import {
  SPLIT,
  MERGE,
  SET_CONTENT,
  REMOVE,
  CLEAR,
  SET_SELECTION,
} from './constants'
import { isAtomicInlineType } from '../lib/util'
import {
  entityForBlockIndex,
  selectionHasRange,
  symbolToAtomicType,
  blockAtIndex,
} from './util'

export default (state, action) =>
  produce(state, draft => {
    draft.operations = []
    draft.preventDefault = false

    const { payload } = action

    // default nextSelection to `payload.selection` (which may be undef)
    const nextSelection = payload.selection

    switch (action.type) {
      case SPLIT: {
        const _text =
          state.entityCache[
            state.blockCache[state.blocks[payload.index]._id].entityId
          ].text.textValue
        // don't allow SPLIT inside atomic
        if (
          isAtomicInlineType(
            state.blockCache[state.blocks[payload.index]._id].type
          ) &&
          state.selection.focus.offset > 0 &&
          state.selection.focus.offset < _text.length - 1
        ) {
          draft.preventDefault = true
          break
        }

        // add or insert a new block
        const _id = ObjectId().toHexString()
        const entityId = ObjectId().toHexString()
        const type = 'ENTRY'
        draft.blockCache[_id] = { type, entityId }

        if (payload.previous.textValue.length === 0) {
          // insert empty entry above
          draft.blocks.splice(payload.index, 0, { _id })
          draft.entityCache[entityId] = {
            type,
            _id: entityId,
            text: payload.previous,
          }
        } else {
          draft.entityCache[
            state.blockCache[state.blocks[payload.index]._id].entityId
          ].text =
            payload.previous

          // insert/add split below
          if (payload.index === draft.blocks.length - 1) {
            draft.blocks.push({ _id })
          } else {
            draft.blocks.splice(payload.index + 1, 0, { _id })
          }

          draft.entityCache[entityId] = {
            type,
            _id: entityId,
            text: payload.text,
          }
        }

        // push updates operation back to editor
        draft.operations.push({
          index: payload.index,
          block:
            draft.entityCache[
              draft.blockCache[draft.blocks[payload.index]._id].entityId
            ],
        })
        draft.operations.push({
          index: payload.index + 1,
          block:
            draft.entityCache[
              draft.blockCache[draft.blocks[payload.index + 1]._id].entityId
            ],
        })
        break
      }
      case MERGE: {
        const _mergingIntoAtomic = isAtomicInlineType(
          state.blockCache[state.blocks[payload.index]._id].type
        )
        const _mergingAtomic = isAtomicInlineType(
          state.blockCache[state.blocks[payload.index + 1]._id].type
        )
        if (_mergingIntoAtomic || _mergingAtomic) {
          draft.preventDefault = true
          break
        }

        const _entity = entityForBlockIndex(draft, payload.index)

        // update node text
        if (!_mergingIntoAtomic) {
          _entity.text = payload.text
        }

        // remove block(s)
        for (let i = 1; i < payload.blockDelta + 1; i += 1) {
          delete draft.entityCache[
            state.blockCache[state.blocks[payload.index + i]._id].entityId
          ]
          delete draft.blockCache[state.blocks[payload.index + i]._id]
        }
        draft.blocks.splice(payload.index + 1, payload.blockDelta)

        break
      }
      case SET_CONTENT: {
        // prevent default is prevent if operation includes atomic
        if (
          payload.operations.find(op =>
            isAtomicInlineType(
              state.blockCache[state.blocks[op.index]._id].type
            )
          )
        ) {
          draft.preventDefault = true
          break
        }

        payload.operations.forEach(op => {
          // update node text
          const _entity = entityForBlockIndex(draft, op.index)
          _entity.text = op.text
          // push update operation back to editor
          draft.operations.push({
            index: op.index,
            block: _entity,
          })
          return
        })
        break
      }
      case REMOVE: {
        delete draft.entityCache[
          state.blockCache[state.blocks[payload.index]._id].entityId
        ]
        delete draft.blockCache[state.blocks[payload.index]._id]
        draft.blocks.splice(payload.index, 1)
        break
      }
      case CLEAR: {
        // delete the current entity
        delete draft.entityCache[
          state.blockCache[state.blocks[payload.index]._id].entityId
        ]
        // create a new entity
        const type = 'ENTRY'
        const entityId = ObjectId().toHexString()
        const _entity = {
          type,
          _id: entityId,
          text: { textValue: '', ranges: [] },
        }
        draft.entityCache[entityId] = _entity
        draft.blockCache[state.blocks[payload.index]._id] = {
          type,
          entityId,
        }
        // push update operation back to editor
        draft.operations.push({
          index: payload.index,
          block: _entity,
        })
        break
      }
      case SET_SELECTION: {
        const { selection } = payload
        const _hasRange = selectionHasRange(selection)
        const _entity = entityForBlockIndex(draft, selection.focus.index)
        const _previousEntity = entityForBlockIndex(
          draft,
          state.selection.focus.index
        )
        const _selectionIndexHasChanged =
          selection.focus.index !== state.selection.focus.index

        if (isAtomicInlineType(_entity.type)) {
          const _isActive =
            !_hasRange &&
            selection.focus.offset < _entity.text.textValue.length &&
            selection.focus.offset > 0

          // only push an update if the `isActive` has changed
          if (_selectionIndexHasChanged || _entity.isActive !== _isActive) {
            _entity.isActive = _isActive
            draft.operations.push({
              index: selection.focus.index,
              block: _entity,
            })
          }
        }
        // if we've moved selection index,
        //   check previous selection for active entity, deactivate if necessary
        if (_selectionIndexHasChanged) {
          if (_previousEntity && _previousEntity.isActive) {
            _previousEntity.isActive = false
            draft.operations.push({
              index: state.selection.focus.index,
              block: _previousEntity,
            })
          }
        }
        break
      }
      default:
    }

    // update the selection unless we're doing `preventDefault`
    if (nextSelection && !draft.preventDefault) {
      draft.selection = nextSelection
    }

    if (draft.selection.focus.index !== state.selection.focus.index) {
      const _entity = entityForBlockIndex(draft, state.selection.focus.index)
      // check if current text should be converted to atomic block
      if (
        _entity &&
        !isAtomicInlineType(_entity.type) &&
        !_entity.text.textValue.match(`\n`)
      ) {
        const _atomicType = symbolToAtomicType(_entity.text.textValue.charAt(0))
        if (_atomicType) {
          // push atomic block change to entityCache and editor operations
          const _nextEntity = {
            text: {
              textValue: _entity.text.textValue.substring(1).trim(),
              ranges: _entity.text.ranges,
            },
            type: _atomicType,
            _id: _entity._id,
          }
          const _block = blockAtIndex(draft, state.selection.focus.index)
          _block.type = _atomicType
          draft.entityCache[_entity._id] = _nextEntity
          draft.operations.push({
            index: state.selection.focus.index,
            block: _nextEntity,
          })
        }
      }
    }

    return draft
  })
