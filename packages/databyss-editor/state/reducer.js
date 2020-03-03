import ObjectId from 'bson-objectid'
import { produce } from 'immer'
import { SPLIT, MERGE, SET_CONTENT, REMOVE, CLEAR } from './constants'
import { isAtomicInlineType, isTextAtomicAtIndex } from '../lib/util'

export default (state, action) =>
  produce(state, draft => {
    draft.operations = []
    draft.preventDefault = false

    const { payload } = action

    switch (action.type) {
      case SPLIT: {
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
          // if not atomic, update split block
          if (
            !isAtomicInlineType(
              state.blockCache[state.blocks[payload.index]._id].type
            )
          ) {
            draft.entityCache[
              state.blockCache[state.blocks[payload.index]._id].entityId
            ].text =
              payload.previous
          }

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

        const _entity =
          draft.entityCache[
            state.blockCache[state.blocks[payload.index]._id].entityId
          ]

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
        if (
          isAtomicInlineType(
            state.blockCache[state.blocks[payload.index]._id].type
          )
        ) {
          draft.preventDefault = true
          break
        }

        // update node text
        // TODO: handle type changing if text includes type operator
        const _entity =
          draft.entityCache[
            state.blockCache[state.blocks[payload.index]._id].entityId
          ]
        _entity.text = payload.text

        // push update operation back to editor
        draft.operations.push({
          index: payload.index,
          block: _entity,
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
      default:
    }

    // always update the selection if included in payload
    // (unless we're doing `preventDefault`)
    if (action.payload.selection && !draft.preventDefault) {
      draft.selection = action.payload.selection
    }

    if (draft.selection.focus.index !== state.selection.focus.index) {
      const _idx = state.selection.focus.index
      const _id = state.blocks[state.selection.focus.index]._id
      const _entity = state.entityCache[state.blockCache[_id].entityId]

      if (!isAtomicInlineType(_entity.type)) {
        let _isAtomic = isTextAtomicAtIndex(state, _idx)
        if (_isAtomic) {
          draft.entityCache[_entity._id] = _isAtomic
          draft.operations.push({
            index: _idx,
            block: _isAtomic,
          })
        }
      }

      //   // console.log(_entity)
      //   // console.log(_id)
      //   // TODO: transform block type if symbol is present
      // }
    }
    return draft
  })
