import 'core-js/features/string/replace-all'
import { uid } from '@databyss-org/data/lib/uid'
import { produceWithPatches, enablePatches, applyPatches, Patch } from 'immer'
import {
  FSA,
  BlockType,
  Block,
  Topic,
  Source,
} from '@databyss-org/services/interfaces'
import { replaceInlineText } from '@databyss-org/services/text/inlineUtils'
import {
  SPLIT,
  MERGE,
  SET_CONTENT,
  REMOVE,
  REMOVE_AT_SELECTION,
  CLEAR,
  SET_SELECTION,
  DEQUEUE_NEW_ENTITY,
  DEQUEUE_REMOVED_ENTITY,
  PASTE,
  CUT,
  UNDO,
  REDO,
  CACHE_ENTITY_SUGGESTIONS,
  PASTE_EMBED,
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
  trim,
  trimLeft,
  trimRight,
  splitBlockAtEmptyLine,
  convertInlineToAtomicBlocks,
  convertInlineToEmbed,
  getRangesAtPoint,
  pushAtomicChangeUpstream,
  getTextOffsetWithRange,
  atomicTypeToInlineRangeType,
  selectionIncludesInlineAtomics,
} from './util'
import { EditorState, PayloadOperation } from '../interfaces'
import mergeInlineAtomicMenuRange from '../lib/clipboardUtils/mergeInlineAtomicMenuRange'
import {
  RangeType,
  InlineTypes,
} from '../../databyss-services/interfaces/Range'
import { OnChangeArgs } from './EditorProvider'
import { normalizeDatabyssBlock } from '../lib/clipboardUtils/databyssFragToHtmlString'

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

  // check for inline atomic
  const _doesBlockHaveInlineAtomicRange = !!_block?.text.ranges.filter(
    (r) =>
      r.marks.length &&
      r.marks.filter(
        (i) =>
          Array.isArray(i) &&
          (i[0] === InlineTypes.InlineTopic ||
            i[0] === InlineTypes.InlineSource)
      ).length
  ).length

  if (
    _block &&
    !isAtomicInlineType(_block.type) &&
    !_doesBlockHaveInlineAtomicRange &&
    !_block.text.textValue.match(`\n`)
  ) {
    const _atomicType = symbolToAtomicType(_block.text.textValue.charAt(0))

    // if current block is empty with n atomic prefix, replace block with new empty block
    if (_block.text.textValue.trim().length < 2 && _atomicType) {
      // create a new entity
      const _block: Block = {
        type: BlockType.Entry,
        _id: uid(),
        text: { textValue: '', ranges: [] },
      }
      draft.blocks[index] = _block

      // push update operation back to editor
      draft.operations.push({
        index,
        block: blockValue(_block),
      })
      return null
    }

    if (_atomicType) {
      let _atomicId = _block._id
      let _atomicTextValue = _block.text.textValue.substring(1).trim()

      // check entitySuggestionCache for an atomic with the identical name
      // if there's a match and the atomic type matches, use the cached
      // block's _id and textValue (to correct casing differences)
      const _suggestion =
        draft.entitySuggestionCache?.[_atomicTextValue.toLowerCase()]
      if (_suggestion?.type === _atomicType) {
        _atomicId = _suggestion._id
        _atomicTextValue = _suggestion.text.textValue
      }

      // replace block in state.blocks and push editor operation
      draft.blocks[index] = {
        text: {
          // ranges need to account for the removal of the first string `@` or `#`
          textValue: _atomicTextValue,
          // location marks are not allowed in atomic types
          ranges: removeLocationMark(offsetRanges(_block.text.ranges, 1)),
        },
        type: _atomicType,
        _id: _atomicId,
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
            _id: uid(),
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

      return _suggestion || draft.blocks[index]
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

    // change cursor position to update with atomic closure
    if (_atomicClosureType) {
      if (!isAtomicInlineType(_block.type)) {
        // if on last block. add new block below
        if (draft.blocks.length - 1 === index) {
          // create a new entity
          const _newBlock: Block = {
            type: BlockType.Entry,
            _id: uid(),
            text: { textValue: '', ranges: [] },
          }
          draft.blocks[index + 1] = _newBlock

          // push update operation back to editor
          draft.operations.push({
            index: index + 1,
            block: blockValue(_newBlock),
          })
        }
        // if in the middle of a page, set selection at start of next block

        const _cursor = {
          offset: 0,
          index: index + 1,
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
                _id: uid(),
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
  onChange?: (props: OnChangeArgs) => void
): EditorState => {
  let clearBlockRelations = false

  const [nextState, patches, inversePatches] = produceWithPatches(
    state,
    (draft: EditorState) => {
      draft.operations = []
      draft.preventDefault = false
      // if flag is set, atomics were added or removed, blockRelations must be refreshed upstream and the headers must be reset

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
          pushAtomicChangeUpstream({ state, draft })
          draft.operations.reloadAll = true
          break
        }
        case REDO: {
          payload.patches.forEach((p: Patch) => {
            if (p.path[0] === 'blocks' || p.path[0] === 'selection') {
              applyPatches(draft, [p])
            }
          })

          pushAtomicChangeUpstream({ state, draft })

          draft.operations.reloadAll = true

          break
        }
        case CUT: {
          deleteBlocksAtSelection(draft)
          pushSingleBlockOperation({ stateSelection: state.selection, draft })
          break
        }
        case PASTE: {
          const _frag = payload.data as Block[]
          const { replace } = payload

          if (!_frag.length) {
            break
          }

          // check if paste is occuring on an atomic block

          const { anchor: _startAnchor } = sortSelection(state.selection)
          const _startBlock = state.blocks[_startAnchor.index]

          // if selection in the middle of atomic or inline atomic prevent paste
          if (
            !isSelectionCollapsed(state.selection) ||
            _startBlock.text.textValue.length !== _startAnchor.offset
          ) {
            // check for inline atomic
            const _isSelectionOnInlineAtomic = !!getRangesAtPoint({
              blocks: draft.blocks,
              point: draft.selection.anchor,
            }).filter(
              (r) =>
                r.marks.length &&
                r.marks.filter(
                  (i) =>
                    Array.isArray(i) &&
                    (i[0] === InlineTypes.InlineTopic ||
                      i[0] === InlineTypes.InlineSource)
                ).length
            ).length

            if (
              _isSelectionOnInlineAtomic ||
              isAtomicInlineType(_startBlock.type)
            ) {
              break
            }
          }

          if (!isSelectionCollapsed(state.selection)) {
            deleteBlocksAtSelection(draft)
          }

          const _replace =
            replace ||
            !draft.blocks[draft.selection.anchor.index].text.textValue.length

          const _rangesAtCurrentSelection = getRangesAtPoint({
            blocks: draft.blocks,
            point: draft.selection.anchor,
          })

          /*
            allow pasting an single atomic block in an inline field
          */
          const _isAtomicBeingPastedIntoInline =
            _frag.length === 1 &&
            isAtomicInlineType(_frag[0].type) &&
            !!_rangesAtCurrentSelection.filter((r) =>
              r.marks.includes(RangeType.InlineAtomicInput)
            ).length

          const _fragContainsEmbed = _frag.find((block) =>
            block.text.ranges.find((range) =>
              range.marks.find(
                (mark) => Array.isArray(mark) && mark[0] === InlineTypes.Embed
              )
            )
          )

          // if replacing, fragment contains multiple blocks, the cursor block is empty,
          // the cursor block is atomic, or the fragment starts with an atomic,
          // do not split the cursor block...
          if (
            !_isAtomicBeingPastedIntoInline &&
            (_frag.length > 1 ||
              _replace ||
              isAtomicInlineType(_frag[0].type) ||
              isAtomicInlineType(_startBlock.type) ||
              _fragContainsEmbed)
          ) {
            // check if we are pasting inside of an inline atomic field
            if (
              _rangesAtCurrentSelection.filter((r) =>
                r.marks.includes(RangeType.InlineAtomicInput)
              ).length
            ) {
              break
            }

            // if replacing or cursor block is empty, start inserting the fragments here
            // otherwise, insert them on the following line
            const _spliceIndex = _replace
              ? draft.selection.anchor.index
              : draft.selection.anchor.index + 1

            // insert blocks at index
            draft.blocks.splice(_spliceIndex, _replace ? 1 : 0, ..._frag)

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

            // check if we are pasting inside of an inline atomic field
            const _ranges = getRangesAtPoint({
              blocks: draft.blocks,
              point: draft.selection.anchor,
            })

            if (
              _ranges.filter((r) =>
                r.marks.includes(RangeType.InlineAtomicInput)
              ).length
            ) {
              /*
              if pasting within an inlineAtomicMenu field
              strip all text and carriage returns from text being pasted, add the mark `inlineAtomicMenu` to data being pasted
              */
              const _fragment = _frag[0].text
              _fragment.textValue = _fragment.textValue
                .replaceAll(/\n|\t/gi, ' ')
                .trim()

              _fragment.ranges = [
                {
                  offset: 0,
                  length: _fragment.textValue.length,
                  marks: [RangeType.InlineAtomicInput],
                },
              ]
              // insert pasted text
              insertText({
                block: draft.blocks[draft.selection.anchor.index],
                text: _frag[0].text,
                offset: draft.selection.anchor.offset,
              })

              // merge 'inlineAtomicMenu Ranges'

              mergeInlineAtomicMenuRange({
                block: draft.blocks[draft.selection.anchor.index],
              })
            } else {
              insertText({
                block: draft.blocks[draft.selection.anchor.index],
                text: _frag[0].text,
                offset: draft.selection.anchor.offset,
              })
            }

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

          pushAtomicChangeUpstream({ state, draft })

          break
        }
        case PASTE_EMBED: {
          const _currentOffset = draft.selection.anchor.offset

          insertText({
            block: draft.blocks[draft.selection.anchor.index],
            text: {
              textValue: payload.data,
              ranges: [
                {
                  offset: 0,
                  length: payload.data.length,
                  marks: [payload.inlineType],
                },
              ],
            },
            offset: _currentOffset,
          })
          // normalize node so ranges are unified

          const _block = normalizeDatabyssBlock(
            draft.blocks[draft.selection.anchor.index]
          )
          // replace current block
          draft.blocks[draft.selection.anchor.index] = _block

          // update cursor
          const _cursor = {
            index: draft.selection.anchor.index,
            offset: _currentOffset + payload.data.length,
          }

          nextSelection = {
            _id: draft.selection._id,
            anchor: _cursor,
            focus: _cursor,
          }

          draft.operations.push({
            index: state.selection.anchor.index,
            block: _block,
          })

          // draft.operations.reloadAll = true

          break
        }

        case SPLIT: {
          // don't allow SPLIT inside atomic
          if (
            isAtomicInlineType(state.blocks[payload.index].type) &&
            state.selection.focus.offset > 0 &&
            state.selection.focus.offset <
              state.blocks[payload.index].text.textValue.length - 1
          ) {
            draft.preventDefault = true
            break
          }

          const _leadingNext = trimLeft(payload.text)

          const _newBlockFields = () => ({
            _id: uid(),
            createdAt: Date.now(),
            type: BlockType.Entry,
          })

          // add or insert a new block
          const _payloadBlock: Block = {
            ..._newBlockFields(),
            text: payload.text,
          }
          trim(_payloadBlock)
          const _previousBlock: Block = {
            ..._newBlockFields(),
            text: payload.previous,
          }
          trim(_previousBlock)

          // add or insert a new block
          const _block: Block = {
            ..._newBlockFields(),
            text: _payloadBlock.text,
          }

          let _insertAt = payload.index

          if (_previousBlock.text.textValue.length === 0) {
            // insert empty entry above
            draft.blocks.splice(_insertAt, 0, _block)
            _block.text = _previousBlock.text
          } else {
            // do not allow content change if previous block is closure type
            if (!getClosureType(draft.blocks[_insertAt].type)) {
              draft.blocks[_insertAt].text = _previousBlock.text
            }

            // if 2nd block in split has text, insert an empty block before it
            if (_block.text.textValue.length) {
              const _emptyBlock: Block = {
                ..._newBlockFields(),
                text: { textValue: '', ranges: [] },
              }
              if (_insertAt === draft.blocks.length - 1) {
                draft.blocks.push(_emptyBlock)
              } else {
                draft.blocks.splice(_insertAt + 1, 0, _emptyBlock)
              }

              // add insertAfter operation to backflow with empty line
              draft.operations.push({
                index: _insertAt + 1,
                insertBefore: true,
                block: blockValue(_emptyBlock),
              })

              _insertAt += 1

              // increment cursor
              if (!_leadingNext) {
                nextSelection = {
                  _id: draft.selection._id,
                  anchor: { index: _insertAt + 1, offset: 0 },
                  focus: { index: _insertAt + 1, offset: 0 },
                }
              }
            }

            // insert/add split below
            if (_insertAt === draft.blocks.length - 1) {
              draft.blocks.push(_block)
            } else {
              draft.blocks.splice(_insertAt + 1, 0, _block)
            }
          }

          // push updates to both blocks involved in split
          draft.operations.push({
            index: _insertAt + 1,
            block: blockValue(draft.blocks[_insertAt + 1]),
          })
          draft.operations.push({
            index: payload.index,
            block: blockValue(draft.blocks[payload.index]),
          })

          // do not allow operation push if previous block is a closure type
          if (getClosureType(draft.blocks[payload.index].type)) {
            break
          }

          break
        }
        case MERGE: {
          const _mergingIntoAtomic = isAtomicInlineType(
            state.blocks[payload.index].type
          )
          const _mergingAtomic = isAtomicInlineType(
            state.blocks[payload.index + 1].type
          )
          const _mergingTitle = payload.index === 0
          if (_mergingIntoAtomic || _mergingAtomic || _mergingTitle) {
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
                !op.isRefEntity &&
                !op.fromSync
            )
          ) {
            draft.preventDefault = true
            break
          }

          // preventDefault if operation inlcudes inline atomic
          if (
            !payload.operations.find((op) => op.isRefEntity) &&
            selectionIncludesInlineAtomics({
              blocks: draft.blocks,
              selection: draft.selection,
            })
          ) {
            draft.preventDefault = true
            break
          }

          payload.operations.forEach((op: PayloadOperation) => {
            // update node text
            let _block = draft.blocks[op.index]

            // // stop fromSync if no changes
            // if (op.fromSync && fastDeepEqual(op.text, _block.text)) {
            //   return
            // }

            // if operation is ref entity, handle separately

            if (!op.isRefEntity) {
              _block.text = op.text
            }

            // console.log('[SET_CONTENT]', JSON.stringify(_block))

            // check for atomic closure
            if (bakeAtomicClosureBlock({ draft, index: op.index })) {
              // set selection at end of atomic
              nextSelection = draft.selection

              // if an atomic closure has been created, re-run the block relations algorithm and clear current block relations

              clearBlockRelations = true
              return
            }

            if (op.isRefEntity) {
              // update all blocks with matching _id and push ops for each
              draft.blocks.forEach((_b, _idx) => {
                // block is top level atomic
                if (_b._id === op.isRefEntity?._id) {
                  _block = draft.blocks[_idx]
                  _block.text = op.text

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
                } else if (op.isRefEntity) {
                  // check text value to update any inline atomics found
                  // use shortname if provided for inlines
                  const _refText = op.isRefEntity?.shortName || op.text

                  const _newText = replaceInlineText({
                    text: _b.text,
                    refId: op.isRefEntity._id,
                    newText: _refText,
                    type: atomicTypeToInlineRangeType(op.isRefEntity.type),
                    // type: InlineTypes.InlineTopic,
                  })

                  if (_newText) {
                    const _newBlock = {
                      ...draft.blocks[_idx],
                      text: _newText,
                    }
                    draft.blocks[_idx] = _newBlock

                    if (_idx === state.selection.anchor.index) {
                      // get current ranges for selection
                      const _ranges = getRangesAtPoint({
                        blocks: draft.blocks,
                        point: state.selection.anchor,
                      })

                      // if current block has the selection and current inline is being updated, set the selection and a flag so the editor can update the selection
                      if (_ranges.length) {
                        const _point = {
                          index: _idx,
                          offset: _ranges[0].offset + _ranges[0].length,
                        }
                        const _newSelection = {
                          ...state.selection,
                          anchor: _point,
                          focus: _point,
                        }
                        nextSelection = _newSelection
                      }
                    }

                    draft.operations.push({
                      index: _idx,
                      block: _newBlock,
                      setSelection: _idx === state.selection.anchor.index,
                    })
                  }
                }
              })
            } else if (op.withBakeAtomic) {
              // reset block relations
              clearBlockRelations = true
              bakeAtomicBlock({ draft, index: op.index })
            } else if (op.convertInlineToAtomic) {
              convertInlineToAtomicBlocks({
                block: _block,
                index: op.index,
                draft,
              })
            } else if (op.convertInlineToEmbed) {
              convertInlineToEmbed({
                block: _block,
                index: op.index,
                draft,
                // if suggestion is passed, append to suggest property, else append to attributes property
                ...(op?.convertInlineToEmbed?.text
                  ? { suggestion: op.convertInlineToEmbed }
                  : { attributes: op.convertInlineToEmbed }),
              })
            } else if (op.withRerender) {
              // if operation requires re-render push operation upstream
              draft.operations.push({
                index: op.index,
                block: _block,
              })
              pushAtomicChangeUpstream({ state, draft })
            } else if (op.checkAtomicDelta) {
              pushAtomicChangeUpstream({ state, draft })
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
        case DEQUEUE_REMOVED_ENTITY: {
          draft.removedEntities = state.removedEntities.filter(
            (q) => q._id !== payload.id
          )
          break
        }

        case REMOVE_AT_SELECTION: {
          // get highlighted text and verify if its the last atomic being removed

          // remove atomics from sidebar
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
          let _block = blockValue(new Block())
          draft.blocks[payload.index] = _block

          // push update operation back to editor
          draft.operations.push({
            index: payload.index,
            block: _block,
          })

          /*
          check if next block with same id is a closure block and clear that block as well
          */
          const _idx = draft.blocks.findIndex((b) => b._id === _oldBlock._id)

          if (_idx > -1 && getClosureType(draft.blocks[_idx].type)) {
            _block = blockValue(new Block())
            draft.blocks[_idx] = _block
            draft.operations.push({
              index: _idx,
              block: _block,
            })
          }
          pushAtomicChangeUpstream({ state, draft })
          break
        }
        case CACHE_ENTITY_SUGGESTIONS: {
          const blocks: Topic[] | Source[] = payload.blocks
          draft.entitySuggestionCache = draft.entitySuggestionCache || {}
          // cache suggestions according to long name
          blocks.forEach((block) => {
            // entity suggestion might be a page block
            const _name = block?.text?.textValue?.toLowerCase() || block?.name

            draft.entitySuggestionCache[_name] = block
          })
          // cache suggestions according to short name
          blocks.forEach((block) => {
            if (block?.name && block?.name?.textValue) {
              draft.entitySuggestionCache[
                block.name.textValue.toLowerCase()
              ] = block
            }
          })

          break
        }
        case SET_SELECTION: {
          /* 
            if selection is collapsed, check if we were in an `activeInlineMenu` trap focus until user bakes inline atomic
          */
          if (!selectionHasRange(draft.selection)) {
            const _activeRangesBefore = getRangesAtPoint({
              blocks: state.blocks,
              point: state.selection.anchor,
            })
            const _activeRangesAfter = getRangesAtPoint({
              blocks: state.blocks,
              point: action.payload.selection.anchor,
            })

            const _activeInlineBefore = _activeRangesBefore.filter((r) =>
              r.marks.includes(RangeType.InlineAtomicInput)
            )
            const _activeInlineAfter = _activeRangesAfter.filter((r) =>
              r.marks.includes(RangeType.InlineAtomicInput)
            )

            // if active selection was 'inlineAtomicMenu and' before and not after, convert inlines to atomic
            if (_activeInlineBefore.length && !_activeInlineAfter.length) {
              const _index = draft.selection.anchor.index
              convertInlineToAtomicBlocks({
                block: draft.blocks[_index],
                index: _index,
                draft,
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

      const _inTitleBlock =
        draft.firstBlockIsTitle && state.selection.focus.index === 0
      if (
        !_inTitleBlock &&
        draft.selection.focus.index !== state.selection.focus.index
      ) {
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

        // trim leading and trailing linebreaks
        if (
          trimLeft(draft.blocks[state.selection.focus.index]) ||
          trimRight(draft.blocks[state.selection.focus.index])
        ) {
          draft.operations.push({
            index: state.selection.focus.index,
            block: blockValue(draft.blocks[state.selection.focus.index]),
          })
        }

        // if there are any empty lines in the block, split it into two
        //   by setting the `insertBefore` bit on the operation
        if (
          splitBlockAtEmptyLine({ draft, atIndex: state.selection.focus.index })
        ) {
          draft.operations.push({
            index: state.selection.focus.index,
            block: blockValue(draft.blocks[state.selection.focus.index]),
          })
          draft.operations.push({
            index: state.selection.focus.index + 1,
            block: blockValue(draft.blocks[state.selection.focus.index + 1]),
            insertBefore: true,
          })

          // if new selection index is greater than previous, increment by one
          //   to accommodate the split
          if (draft.selection.focus.index > state.selection.focus.index) {
            draft.selection.anchor.index += 1
            draft.selection.focus.index += 1
          }

          // re-index blockRelations because we have essentially performed a SPLIT
          clearBlockRelations = true
        }
      }

      // VALIDATE SELECTION
      // if next selection doesnt exist, replace selection with origin
      if (
        !draft.blocks[draft.selection.focus.index] ||
        !draft.blocks[draft.selection.anchor.index]
      ) {
        draft.selection = {
          _id: uid(),
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
        block.__showInlineTopicMenu = false
        block.__showInlineCitationMenu = false
        block.__showInlineEmbedMenu = false
        block.__showInlineLinkMenu = false
      })
      const _selectedBlock = draft.blocks[draft.selection.focus.index]

      if (_selectedBlock) {
        // show newBlockMenu if selection is collapsed and is empty
        _selectedBlock.__showNewBlockMenu =
          !selectionHasRange(draft.selection) &&
          !_selectedBlock.text.textValue.length

        // block new topic menu if current range is inlineTopic
        const _doesBlockHaveInlineAtomicRange = !!_selectedBlock.text.ranges.filter(
          (r) =>
            r.marks.length &&
            r.marks.filter(
              (i) =>
                Array.isArray(i) &&
                (i[0] === InlineTypes.InlineTopic ||
                  i[0] === InlineTypes.InlineSource)
            )
        ).length

        _selectedBlock.__showCitationMenu =
          _selectedBlock.text.textValue.startsWith('@') &&
          !_selectedBlock.text.textValue.match(`\n`) &&
          !_doesBlockHaveInlineAtomicRange

        _selectedBlock.__showTopicMenu =
          _selectedBlock.text.textValue.startsWith('#') &&
          !_selectedBlock.text.textValue.match(`\n`) &&
          !_doesBlockHaveInlineAtomicRange

        // check if selected block has range type 'inlineAtomicMenu'
        const _hasInlineMenuMark = _selectedBlock.text.ranges.reduce(
          (acc, curr) => {
            if (acc === true) {
              return true
            }
            if (
              curr.marks.includes(RangeType.InlineAtomicInput) ||
              curr.marks.includes(RangeType.InlineEmbedInput) ||
              curr.marks.includes(RangeType.InlineLinkInput)
            ) {
              return true
            }
            return false
          },
          false
        )

        // show __showInlineTopicMenu, __showInlineCitationMenu, or __showInlineEmbedMenu if selection is collapsed, selection is within text precedded with a `#` or `@` and it is currently not tagged already
        if (_hasInlineMenuMark) {
          // check to see if inline mark is source or topic
          const inlineMarkupData = getTextOffsetWithRange({
            text: _selectedBlock.text,
            rangeType: RangeType.InlineAtomicInput,
          })
          // first character in atomic input range
          const _symbol = inlineMarkupData?.text.substring(0, 1)
          if (_symbol && !selectionHasRange(draft.selection)) {
            const _inlineAtomicType = symbolToAtomicType(_symbol)
            if (_inlineAtomicType === BlockType.Topic) {
              _selectedBlock.__showInlineTopicMenu = true
            }
            if (_inlineAtomicType === BlockType.Source) {
              _selectedBlock.__showInlineCitationMenu = true
            }
          }
        }

        // check if in active embed menu
        const inlineEmbedData = getTextOffsetWithRange({
          text: _selectedBlock.text,
          rangeType: RangeType.InlineEmbedInput,
        })

        if (
          inlineEmbedData &&
          !selectionHasRange(draft.selection) &&
          _selectedBlock.text.textValue.replaceAll(/\s/g, '').length > 4
        ) {
          _selectedBlock.__showInlineEmbedMenu = true
        }

        // check if active linke menu
        const inlineLinkData = getTextOffsetWithRange({
          text: _selectedBlock.text,
          rangeType: RangeType.InlineLinkInput,
        })

        if (inlineLinkData && !selectionHasRange(draft.selection)) {
          _selectedBlock.__showInlineLinkMenu = true
        }

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
      type: action.type,
      clearBlockRelations,
    })
  }
  return nextState
}
