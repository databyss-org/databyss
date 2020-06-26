import ObjectId from 'bson-objectid'
import { produceWithPatches, enablePatches } from 'immer'
import {
  SPLIT,
  MERGE,
  SET_CONTENT,
  REMOVE,
  CLEAR,
  SET_SELECTION,
  DEQUEUE_NEW_ENTITY,
} from './constants'
import { isAtomicInlineType } from '../lib/util'
import {
  entityForBlockIndex,
  selectionHasRange,
  symbolToAtomicType,
  blockAtIndex,
  getIndeciesForRefId,
  offsetRanges,
  removeLocationMark,
  cleanupState,
  blockValue,
} from './util'

export const bakeAtomicBlock = ({ state, draft, index }) => {
  const _entity = entityForBlockIndex(draft, index)

  // check if current text should be converted to atomic block
  if (
    _entity &&
    !isAtomicInlineType(_entity.type) &&
    !_entity.text.textValue.match(`\n`)
  ) {
    let _atomicType = symbolToAtomicType(_entity.text.textValue.charAt(0))

    if (_atomicType) {
      // push atomic block change to entityCache and editor operations
      const _nextEntity = {
        text: {
          // ranges need to account for the removal of the first string `@` or `#`
          textValue: _entity.text.textValue.substring(1).trim(),
          // location marks are not allowed in atomic types
          ranges: removeLocationMark(offsetRanges(_entity.text.ranges, 1)),
        },
        type: _atomicType,
        _id: _entity._id,
      }

      // revert block to entry if no text in atomic block
      if (_nextEntity.text.textValue.length === 0) {
        _atomicType = 'ENTRY'
        _nextEntity.type = _atomicType
      }

      const _block = blockAtIndex(draft, state.selection.focus.index)
      _block.type = _atomicType
      draft.entityCache[_entity._id] = _nextEntity

      draft.operations.push({
        index: state.selection.focus.index,
        block: _nextEntity,
      })

      return _nextEntity
    }
  }
  return null
}

enablePatches()

export default (state, action, onChange) => {
  const [nextState, patch, inversePatch] = produceWithPatches(state, draft => {
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
          block: blockValue(
            draft.entityCache[
              draft.blockCache[draft.blocks[payload.index]._id].entityId
            ]
          ),
        })
        draft.operations.push({
          index: payload.index + 1,
          block: blockValue(
            draft.entityCache[
              draft.blockCache[draft.blocks[payload.index + 1]._id].entityId
            ]
          ),
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
        // preventDefault if operation includes atomic
        if (
          payload.operations.find(
            op =>
              isAtomicInlineType(
                state.blockCache[state.blocks[op.index]._id].type
              ) && !op.isRefEntity
          )
        ) {
          draft.preventDefault = true
          break
        }

        payload.operations.forEach(op => {
          // update node text
          const _entity = entityForBlockIndex(draft, op.index)
          _entity.text = op.text

          if (op.isRefEntity) {
            getIndeciesForRefId(state, _entity._id).forEach(i =>
              draft.operations.push({
                index: i,
                block: { ..._entity, isActive: false },
              })
            )
          } else if (op.withBakeAtomic) {
            bakeAtomicBlock({ state, draft, index: op.index })
          } else {
            // update only given entity
            draft.operations.push({
              index: op.index,
              block: blockValue(_entity),
            })
          }
        })
        break
      }
      case DEQUEUE_NEW_ENTITY: {
        let _entityQueue = state.newEntities
        _entityQueue = _entityQueue.filter(q => q._id !== payload.id)
        draft.newEntities = _entityQueue
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
        // unless it's an atomic type, delete the current entity
        if (entityForBlockIndex(state, payload.index).type === 'ENTRY') {
          delete draft.entityCache[
            state.blockCache[state.blocks[payload.index]._id].entityId
          ]
        }
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
          block: blockValue(_entity),
        })
        break
      }
      case SET_SELECTION:
      default:
    }

    // update the selection unless we're doing `preventDefault`
    if (nextSelection && !draft.preventDefault) {
      draft.selection = nextSelection
    }

    if (draft.selection.focus.index !== state.selection.focus.index) {
      // push updates to new entity queue
      const _bakedEntity = bakeAtomicBlock({
        state,
        draft,
        index: state.selection.focus.index,
      })
      if (_bakedEntity && isAtomicInlineType(_bakedEntity.type)) {
        draft.newEntities.push(_bakedEntity)
      }
    }

    // VALIDATE SELECTION
    // if next selection doesnt exist, replace selection with origin
    if (
      !entityForBlockIndex(draft, draft.selection.focus.index) ||
      !entityForBlockIndex(draft, draft.selection.anchor.index)
    ) {
      draft.selection = {
        anchor: { offset: 0, index: 0 },
        focus: { offset: 0, index: 0 },
      }
    }

    // UPDATE BLOCK UI FLAGS
    // flag currently selected block with `__showNewBlockMenu` if empty

    // first reset `__showNewBlockMenu` on all other blocks
    draft.blocks.forEach(block => {
      block.__showNewBlockMenu = false
      block.__isActive = false
    })
    const _selectedBlock = draft.blocks[draft.selection.focus.index]
    const _selectedEntity = entityForBlockIndex(
      draft,
      draft.selection.focus.index
    )

    if (_selectedEntity) {
      // show newBlockMenu if selection is collapsed and is empty
      _selectedBlock.__showNewBlockMenu =
        !selectionHasRange(draft.selection) &&
        !_selectedEntity.text.textValue.length

      // flag blocks with `__isActive` if selection is collapsed and within an atomic element
      _selectedBlock.__isActive =
        !selectionHasRange(draft.selection) &&
        isAtomicInlineType(_selectedEntity.type) &&
        draft.selection.focus.offset < _selectedEntity.text.textValue.length &&
        draft.selection.focus.offset > 0
    }
    return cleanupState(draft)
  })
  onChange({ previousState: state, nextState, patch, inversePatch })
  return nextState
}
