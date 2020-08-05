import ObjectId from 'bson-objectid'
import { produceWithPatches, enablePatches, applyPatches, Patch } from 'immer'
import { FSA, BlockType, Block } from '@databyss-org/services/interfaces'
import {
  SPLIT,
  MERGE,
  SET_CONTENT,
  REMOVE,
  REMOVE_AT_SELECTION,
  CLEAR,
  SET_SELECTION,
  DEQUEUE_NEW_ENTITY,
  PASTE,
  CUT,
  UNDO,
  REDO,
} from './constants'
import { isAtomicInlineType } from '../lib/util'
import {
  isSelectionCollapsed,
  insertText,
  deleteBlocksAtSelection,
  sortSelection,
} from '../lib/clipboardUtils'
import {
  selectionHasRange,
  getOpenAtomicText,
  symbolToAtomicType,
  symbolToAtomicClosureType,
  getClosureTypeFromOpeningType,
  getClosureText,
  getClosureType,
  atomicClosureText,
  getOpenAtomics,
  offsetRanges,
  removeLocationMark,
  blockValue,
  pushSingleBlockOperation,
} from './util'
import { EditorState, PayloadOperation } from '../interfaces'

// if block at @index in @draft.blocks starts with an atomic identifier character,
// e.g. @ or #, convert the block to the appropriate atomic type and return it.
// otherwise return null.
export const bakeAtomicBlock = ({
  draft,
  index,
}: {
  draft: EditorState
  index: number
}): Block | null => {
  const _block = draft.blocks[index]

  // check if current text should be converted to atomic block
  if (
    _block &&
    _block.text.textValue.trim().length > 1 &&
    !isAtomicInlineType(_block.type) &&
    !_block.text.textValue.match(`\n`)
  ) {
    const _atomicType = symbolToAtomicType(_block.text.textValue.charAt(0))

    if (_atomicType) {
      // replace block in state.blocks and push editor operation
      draft.blocks[index] = {
        text: {
          // ranges need to account for the removal of the first string `@` or `#`
          textValue: _block.text.textValue.substring(1).trim(),
          // location marks are not allowed in atomic types
          ranges: removeLocationMark(offsetRanges(_block.text.ranges, 1)),
        },
        type: _atomicType,
        _id: _block._id,
      }

      draft.operations.push({
        index,
        block: draft.blocks[index],
      })

      // perform a lookahead for the next atomic which is type XXX or END_XXX
      const _idx = draft.blocks.findIndex(
        (b, i) =>
          i > index &&
          (b.type === _atomicType ||
            b.type === getClosureTypeFromOpeningType(_atomicType))
      )
      if (_idx > -1) {
        // if next atomic value is closure value, clear closure block
        if (getClosureType(draft.blocks[_idx].type)) {
          const _newBlock: Block = {
            type: BlockType.Entry,
            _id: new ObjectId().toHexString(),
            text: { textValue: '', ranges: [] },
          }
          draft.blocks[_idx] = _newBlock
          // push update operation back to editor
          draft.operations.push({
            index: _idx,
            block: blockValue(_newBlock),
          })
        }
      }
      return draft.blocks[index]
    }
  }
  return null
}

export const bakeAtomicClosureBlock = ({
  draft,
  index,
}: {
  draft: EditorState
  index: number
}): Block | null => {
  const _block = draft.blocks[index]

  // if block has already been tagged as closing
  // if block does not yet exist
  // if theres no atomic to close
  // bail on operation
  if (
    !_block ||
    getClosureType(_block.type) ||
    !getOpenAtomicText(draft).length
  ) {
    return null
  }

  // check if current text should be converted to atomic block
  if (_block && _block.text.textValue.length > 1) {
    const _atomicClosureType = symbolToAtomicClosureType(
      _block.text.textValue.substring(0, 2)
    )

    // change cursor to end of atomic position
    if (_atomicClosureType) {
      // if atomic is not set yet, set selection at tend of atomic
      if (!isAtomicInlineType(_block.type)) {
        const _cursor = {
          offset: getClosureText(_atomicClosureType, draft).length,
          index,
        }
        draft.selection = {
          anchor: _cursor,
          focus: _cursor,
          _id: draft.selection._id,
        }
      }

      // get the atomic block which is being closed
      const _openAtomic = getOpenAtomics(draft).find(
        (b) => b.type === getClosureType(_atomicClosureType)
      )

      if (_openAtomic) {
        // replace block in state.blocks and push editor operation
        draft.blocks[index] = {
          text: {
            // ranges need to account for the removal of the first string `@` or `#`
            textValue: getClosureText(_atomicClosureType, draft),
            // location marks are not allowed in atomic types
            ranges: [],
          },
          type: _atomicClosureType,
          // duplicate id for atomic which block is closing
          _id: _openAtomic._id,
        }
        // perform a closure block lookahead to see if current block has already been closed and remove that block
        if (draft.blocks.length > index + 1) {
          // find next index where same id exists
          const _idx = draft.blocks.findIndex(
            (b, i) => b._id === _openAtomic._id && i > index
          )
          // if id exists in document and next instance is an atomic closure, remove that block and replace it with an empty block
          if (_idx > -1) {
            const _nextBlock = draft.blocks[_idx]
            if (getClosureType(_nextBlock.type)) {
              const _newBlock: Block = {
                type: BlockType.Entry,
                _id: new ObjectId().toHexString(),
                text: { textValue: '', ranges: [] },
              }
              draft.blocks[_idx] = _newBlock

              // push update operation back to editor
              draft.operations.push({
                index: _idx,
                block: blockValue(_newBlock),
              })
            }
          }
        }
      }
      // if type is not set, push to operations
      if (!isAtomicInlineType(_block.type)) {
        draft.operations.push({
          index,
          block: draft.blocks[index],
        })
      }

      return draft.blocks[index]
    }
  }
  return null
}

enablePatches()

export default (
  state: EditorState,
  action: FSA,
  onChange?: Function
): EditorState => {
  const [nextState, patches, inversePatches] = produceWithPatches(
    state,
    (draft) => {
      draft.operations = []
      draft.preventDefault = false

      const { payload } = action

      // default nextSelection to `payload.selection` (which may be undef)
      let nextSelection = payload?.selection

      switch (action.type) {
        case UNDO: {
          payload.patches.forEach((p: Patch) => {
            if (p.path[0] === 'blocks' || p.path[0] === 'selection') {
              applyPatches(draft, [p])
            }
          })
          draft.operations.reloadAll = true

          break
        }
        case REDO: {
          payload.patches.forEach((p: Patch) => {
            if (p.path[0] === 'blocks' || p.path[0] === 'selection') {
              applyPatches(draft, [p])
            }
          })
          draft.operations.reloadAll = true

          break
        }
        case CUT: {
          deleteBlocksAtSelection(draft)
          pushSingleBlockOperation({ stateSelection: state.selection, draft })
          break
        }
        case PASTE: {
          const _frag = payload.data

          if (!_frag.length) {
            break
          }

          // check if paste is occuring on an atomic block

          const { anchor: _startAnchor } = sortSelection(state.selection)
          const _startBlock = state.blocks[_startAnchor.index]

          // if selection in the middle of atomic prevent paste
          if (
            !isSelectionCollapsed(state.selection) ||
            _startBlock.text.textValue.length !== _startAnchor.offset
          ) {
            if (isAtomicInlineType(_startBlock.type)) {
              break
            }
          }

          if (!isSelectionCollapsed(state.selection)) {
            deleteBlocksAtSelection(draft)
          }

          const _isCurrentBlockEmpty = !draft.blocks[
            draft.selection.anchor.index
          ].text.textValue.length

          // if fragment contains multiple blocks, the cursor block is empty, the cursor block is atomic, or the
          // fragment starts with an atomic, do not split the cursor block...
          if (
            _frag.length > 1 ||
            _isCurrentBlockEmpty ||
            isAtomicInlineType(_frag[0].type) ||
            isAtomicInlineType(_startBlock.type)
          ) {
            // if cursor block is empty, start inserting the fragments here
            // otherwise, insert them on the following line
            const _spliceIndex = _isCurrentBlockEmpty
              ? draft.selection.anchor.index
              : draft.selection.anchor.index + 1

            // insert blocks at index
            draft.blocks.splice(
              _spliceIndex,
              _isCurrentBlockEmpty ? 1 : 0,
              ..._frag
            )

            // bake atomic blocks if there were any in the paste
            // this is useful when importing from external source, like PDF
            draft.blocks.forEach((_, index: number) => {
              const _baked = bakeAtomicBlock({ draft, index })
              if (_baked) {
                draft.blocks[index] = _baked
                draft.newEntities.push(_baked)
              }
            })

            draft.operations.reloadAll = true

            // set selection
            const _selectionIndex = _spliceIndex + _frag.length - 1
            const _offset = draft.blocks[_selectionIndex].text.textValue.length

            const _nextSelection = {
              _id: draft.selection._id,
              anchor: { index: _selectionIndex, offset: _offset },
              focus: { index: _selectionIndex, offset: _offset },
            }
            nextSelection = _nextSelection
          } else {
            // we have some text in our fragment to insert at the cursor, so do the split and insert
            insertText({
              block: draft.blocks[draft.selection.anchor.index],
              text: _frag[0].text,
              offset: draft.selection.anchor.offset,
            })

            const _cursor = {
              index: draft.selection.anchor.index,
              offset:
                draft.selection.anchor.offset + _frag[0].text.textValue.length,
            }

            nextSelection = {
              _id: draft.selection._id,
              anchor: _cursor,
              focus: _cursor,
            }

            draft.operations.push({
              index: state.selection.anchor.index,
              block: blockValue(draft.blocks[state.selection.anchor.index]),
            })
          }

          break
        }
        case SPLIT: {
          const _text = state.blocks[payload.index].text.textValue

          // don't allow SPLIT inside atomic
          if (
            isAtomicInlineType(state.blocks[payload.index].type) &&
            state.selection.focus.offset > 0 &&
            state.selection.focus.offset < _text.length - 1
          ) {
            draft.preventDefault = true
            break
          }

          // add or insert a new block
          const _id = new ObjectId().toHexString()
          const _block: Block = {
            type: BlockType.Entry,
            _id,
            text: payload.text,
          }

          if (payload.previous.textValue.length === 0) {
            // insert empty entry above
            draft.blocks.splice(payload.index, 0, _block)
            _block.text = payload.previous
          } else {
            // do not allow content change if previous block is closure type
            if (!getClosureType(draft.blocks[payload.index].type)) {
              draft.blocks[payload.index].text = payload.previous
            }

            // insert/add split below
            if (payload.index === draft.blocks.length - 1) {
              draft.blocks.push(_block)
            } else {
              draft.blocks.splice(payload.index + 1, 0, _block)
            }
          }

          // push updates operation back to editor
          draft.operations.push({
            index: payload.index + 1,
            block: blockValue(draft.blocks[payload.index + 1]),
          })

          // HACK: workaround for a Slate bug
          // see issue #3458: Arrow navigation issue with single-character text node adjacent to inline element
          // https://github.com/ianstormtaylor/slate/issues/3458
          const _prevTextValue = payload.previous.textValue

          if (_prevTextValue.charAt(_prevTextValue.length - 1) === '\n') {
            draft.blocks[
              payload.index
            ].text.textValue = _prevTextValue.substring(
              0,
              _prevTextValue.length - 1
            )
          }

          // do not allow operation push if previous block is a closure type
          if (getClosureType(draft.blocks[payload.index].type)) {
            break
          }

          /*
          if previous value is an atomic closure, dont push operation
          */
          draft.operations.push({
            index: payload.index,
            block: blockValue(draft.blocks[payload.index]),
          })
          break
        }
        case MERGE: {
          const _mergingIntoAtomic = isAtomicInlineType(
            state.blocks[payload.index].type
          )
          const _mergingAtomic = isAtomicInlineType(
            state.blocks[payload.index + 1].type
          )
          if (_mergingIntoAtomic || _mergingAtomic) {
            draft.preventDefault = true
            break
          }

          // update node text
          if (!_mergingIntoAtomic) {
            draft.blocks[payload.index].text = payload.text
          }

          // remove block(s)
          draft.blocks.splice(payload.index + 1, payload.blockDelta)

          break
        }
        case SET_CONTENT: {
          // preventDefault if operation includes atomic
          if (
            payload.operations.find(
              (op: PayloadOperation) =>
                isAtomicInlineType(state.blocks[op.index].type) &&
                !op.isRefEntity
            )
          ) {
            draft.preventDefault = true
            break
          }

          payload.operations.forEach((op: PayloadOperation) => {
            // update node text
            const _block = draft.blocks[op.index]
            _block.text = op.text

            // check for atomic closure
            if (bakeAtomicClosureBlock({ draft, index: op.index })) {
              // set selection at end of atomic
              nextSelection = draft.selection
              return
            }

            if (op.isRefEntity) {
              // update all blocks with matching _id and push ops for each
              draft.blocks.forEach((_b, _idx) => {
                if (_b._id === _block._id) {
                  let _nextBlock = { ..._block, __isActive: false }

                  // if atomic type is closure, get updated text value and overwrite `nextBlock`
                  const _type = draft.blocks[_idx].type

                  if (getClosureType(_type)) {
                    _nextBlock = {
                      ..._nextBlock,
                      ...draft.blocks[_idx],
                      text: {
                        textValue: atomicClosureText(
                          _type,
                          _block.text.textValue
                        ),
                        ranges: [],
                      },
                    }
                  }

                  draft.blocks[_idx] = _nextBlock
                  draft.operations.push({
                    index: _idx,
                    block: _nextBlock,
                  })
                }
              })
            } else if (op.withBakeAtomic) {
              bakeAtomicBlock({ draft, index: op.index })
            } else {
              // update only given entity
              draft.operations.push({
                index: op.index,
                block: blockValue(_block),
              })
            }
          })
          break
        }
        case DEQUEUE_NEW_ENTITY: {
          draft.newEntities = state.newEntities.filter(
            (q) => q._id !== payload.id
          )
          break
        }
        case REMOVE_AT_SELECTION: {
          deleteBlocksAtSelection(draft)
          pushSingleBlockOperation({ stateSelection: state.selection, draft })
          break
        }
        case REMOVE: {
          draft.blocks.splice(payload.index, 1)
          break
        }
        case CLEAR: {
          const _oldBlock = draft.blocks[payload.index]
          // create a new entity
          let _block: Block = {
            type: BlockType.Entry,
            _id: new ObjectId().toHexString(),
            text: { textValue: '', ranges: [] },
          }
          draft.blocks[payload.index] = _block

          // push update operation back to editor
          draft.operations.push({
            index: payload.index,
            block: blockValue(_block),
          })

          /*
          check if next block with same id is a closure block and clear that block as well
          */
          const _idx = draft.blocks.findIndex((b) => b._id === _oldBlock._id)

          if (_idx > -1 && getClosureType(draft.blocks[_idx].type)) {
            _block = {
              type: BlockType.Entry,
              _id: new ObjectId().toHexString(),
              text: { textValue: '', ranges: [] },
            }
            draft.blocks[_idx] = _block
            draft.operations.push({
              index: _idx,
              block: blockValue(_block),
            })
          }

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
        // check for atomic closure on block blur
        bakeAtomicClosureBlock({
          draft,
          index: state.selection.focus.index,
        })

        // push updates to new entity queue
        const _baked = bakeAtomicBlock({
          draft,
          index: state.selection.focus.index,
        })

        if (_baked && isAtomicInlineType(_baked.type)) {
          draft.newEntities.push(_baked)
        }
      }

      // VALIDATE SELECTION
      // if next selection doesnt exist, replace selection with origin
      if (
        !draft.blocks[draft.selection.focus.index] ||
        !draft.blocks[draft.selection.anchor.index]
      ) {
        draft.selection = {
          _id: new ObjectId().toHexString(),
          anchor: { offset: 0, index: 0 },
          focus: { offset: 0, index: 0 },
        }
      }

      // UPDATE BLOCK UI FLAGS
      // flag currently selected block with `__showNewBlockMenu` if empty

      // first reset `__showNewBlockMenu` on all other blocks
      draft.blocks.forEach((block) => {
        block.__showNewBlockMenu = false
        block.__isActive = false
      })
      const _selectedBlock = draft.blocks[draft.selection.focus.index]

      if (_selectedBlock) {
        // show newBlockMenu if selection is collapsed and is empty
        _selectedBlock.__showNewBlockMenu =
          !selectionHasRange(draft.selection) &&
          !_selectedBlock.text.textValue.length

        _selectedBlock.__showCitationMenu = _selectedBlock.text.textValue.startsWith(
          '@'
        )

        // flag blocks with `__isActive` if selection is collapsed and within an atomic element
        _selectedBlock.__isActive =
          !selectionHasRange(draft.selection) &&
          isAtomicInlineType(_selectedBlock.type) &&
          draft.selection.focus.offset < _selectedBlock.text.textValue.length &&
          draft.selection.focus.offset > 0
      }

      return draft
    }
  )

  /*
  historyActions need to bypass the EditorHistory history stack
  */

  if (onChange) {
    onChange({
      previousState: state,
      nextState,
      patches,
      inversePatches,
      undoAction: action.type === UNDO,
      redoAction: action.type === REDO,
    })
  }
  return nextState
}