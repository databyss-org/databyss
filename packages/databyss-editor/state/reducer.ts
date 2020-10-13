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
  CACHE_ENTITY_SUGGESTIONS
} from './constants'
import { isAtomicInlineType } from '../lib/util'
import {
  isSelectionCollapsed,
  insertText,
  deleteBlocksAtSelection,
  sortSelection,
  splitTextAtOffset,
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
  getWordFromOffset,
} from './util'
import { EditorState, PayloadOperation } from '../interfaces'
import { getTextOffsetWithRange } from './util';
import { mergeText } from '../lib/clipboardUtils/index';
import { OPEN_LIBRARY } from '../components/Suggest/SuggestSources'

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
    !isAtomicInlineType(_block.type) &&
    !_block.text.textValue.match(`\n`)
  ) {
    const _atomicType = symbolToAtomicType(_block.text.textValue.charAt(0))

    // if current block is empty with n atomic prefix, replace block with new empty block
    if( _block.text.textValue.trim().length < 2 && _atomicType){
      // create a new entity
      let _block: Block = {
        type: BlockType.Entry,
        _id: new ObjectId().toHexString(),
        text: { textValue: '', ranges: [] },
      }
      draft.blocks[index] = _block

      // push update operation back to editor
      draft.operations.push({
        index: index,
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
      const _suggestion = draft.entitySuggestionCache?.[_atomicTextValue.toLowerCase()]
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

    // change cursor position to update with atomic closure
    if (_atomicClosureType) {
      if (!isAtomicInlineType(_block.type)) {
        // if on last block. add new block below
        if((draft.blocks.length - 1 ) === index){
      // create a new entity
          let _newBlock: Block = {
            type: BlockType.Entry,
            _id: new ObjectId().toHexString(),
            text: { textValue: '', ranges: [] },
          }
          draft.blocks[index+ 1] = _newBlock

          // push update operation back to editor
          draft.operations.push({
            index: index+1,
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
  let clearBlockRelations = false

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
          const { replace } = payload

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

          const _replace = replace || !draft.blocks[
            draft.selection.anchor.index
          ].text.textValue.length


          // if replacing, fragment contains multiple blocks, the cursor block is empty, 
          // the cursor block is atomic, or the fragment starts with an atomic, 
          // do not split the cursor block...
          if (
            _frag.length > 1 ||
            _replace ||
            isAtomicInlineType(_frag[0].type) ||
            isAtomicInlineType(_startBlock.type)
          ) {
            // if replacing or cursor block is empty, start inserting the fragments here
            // otherwise, insert them on the following line
            const _spliceIndex = _replace
              ? draft.selection.anchor.index
              : draft.selection.anchor.index + 1

            // insert blocks at index
            draft.blocks.splice(
              _spliceIndex,
              _replace ? 1 : 0,
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
          // don't allow SPLIT inside atomic
          if (
            isAtomicInlineType(state.blocks[payload.index].type) &&
            state.selection.focus.offset > 0 &&
            state.selection.focus.offset < state.blocks[payload.index].text.textValue.length - 1
          ) {
            draft.preventDefault = true
            break
          }

          const _leadingNext = trimLeft(payload.text)
          trim(payload.text)
          trim(payload.previous)

          // add or insert a new block
          const _block: Block = {
            type: BlockType.Entry,
            _id: new ObjectId().toHexString(),
            text: payload.text,
          }

          let _insertAt = payload.index

          if (payload.previous.textValue.length === 0) {
            // insert empty entry above
            draft.blocks.splice(_insertAt, 0, _block)
            _block.text = payload.previous
          } else {
            // do not allow content change if previous block is closure type
            if (!getClosureType(draft.blocks[_insertAt].type)) {
              draft.blocks[_insertAt].text = payload.previous
            }

            // if 2nd block in split has text, insert an empty block before it
            if (payload.text.textValue.length) {
              const _emptyBlock: Block = {
                type: BlockType.Entry,
                _id: new ObjectId().toHexString(),
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

              // if an atomic closure has been created, re-run the block relations algorithm and clear current block relations

              clearBlockRelations = true
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
              // reset block relations

              clearBlockRelations = true
              bakeAtomicBlock({ draft, index: op.index })
            } else if (op.convertInlineToAtomic){
            /*
              if flag `convertInlineToAtomic` is set, pull out text within range `inlineAtomicMenu`, look up in entityCache and set the markup with appropriate id and range
            */
            let _pushNewEntity = false

            // get the markup data, function returns: offset, length, text
            const inlineMarkupData = getTextOffsetWithRange({
              text: _block.text,
              rangeType: 'inlineAtomicMenu',
            })



            // check if text is inline atomic type
            const _atomicType =inlineMarkupData && symbolToAtomicType(inlineMarkupData?.text.charAt(0))

            if(inlineMarkupData && _atomicType){
              // text value with markup
              let _atomicTextValue = inlineMarkupData?.text

              // new Id for inline atomic
              let _atomicId = new ObjectId().toHexString()

              // check entitySuggestionCache for an atomic with the identical name
              // if there's a match and the atomic type matches, use the cached 
              // block's _id and textValue (to correct casing differences
              const _suggestion = draft.entitySuggestionCache?.[inlineMarkupData.text.substring(1).toLowerCase()]
              // if suggestion exists in cache, grab values
              if (_suggestion?.type === _atomicType) {
                _atomicId = _suggestion._id
                _atomicTextValue = `#${_suggestion.text.textValue}`
              } else {
                // set flag to new push atomic entity to appropriate provider
                _pushNewEntity = true
              }


              // get value before offset
              let _textBefore = splitTextAtOffset({
                text: _block.text,
                offset: inlineMarkupData.offset,
              }).before

              // get value after markup range
              const _textAfter = splitTextAtOffset({
                text: _block.text,
                offset: inlineMarkupData.offset + inlineMarkupData.length,
              }).after

              // merge first block with atomic value, add mark and id to second block
              _textBefore = mergeText(_textBefore, {
                textValue: _atomicTextValue,
                ranges: [
                  {
                    offset: 0,
                    length: _atomicTextValue.length,
                    marks: [['inlineTopic', _atomicId]],
                  },
                ],
              })

              // append an empty space after merge
              _textBefore = mergeText(_textBefore, { textValue: ' ', ranges: [] })

              // get the offset value where the cursor should be placed after operation
              const _caretOffest = _textBefore.textValue.length 


              // merge second block with first block
              const _newText = mergeText(_textBefore, _textAfter)


              _block.text = _newText

              // force a re-render
              draft.operations.push({
                index: op.index,
                block: _block,
              })
              // update selection
              const _nextSelection = {
                _id: draft.selection._id,
                anchor: { index: op.index, offset: _caretOffest },
                focus: { index: op.index, offset: _caretOffest },
              }
              nextSelection = _nextSelection

              if(_pushNewEntity){
                const _entity = {
                  type: _atomicType, 
                  // remove atomic symbol
                  text: {textValue: _atomicTextValue.substring(1), ranges: []},
                  _id: _atomicId
                }
                draft.newEntities.push(_entity)

              }

     
            }



            // let _atomicId = _block._id
            // let _atomicTextValue = _block.text.textValue.substring(1).trim()
      
            // // check entitySuggestionCache for an atomic with the identical name
            // // if there's a match and the atomic type matches, use the cached 
            // // block's _id and textValue (to correct casing differences)
            // const _suggestion = draft.entitySuggestionCache?.[_atomicTextValue.toLowerCase()]
            // if (_suggestion?.type === _atomicType) {
            //   _atomicId = _suggestion._id
            //   _atomicTextValue = _suggestion.text.textValue
            // }
      

            /* text with 'inlineAtomicMenu' should be replaced the atomic type provided
            if `TOPIC` replace with `inlineTopic` and appropriate id
            if `SOURCE` replace with `inlineSource` and id
            */

            }else if (op.withRerender) {
              // if operation requires re-render push operation upstream
              draft.operations.push({
                index: op.index,
                block: _block,
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
        case CACHE_ENTITY_SUGGESTIONS: {
          const blocks: Block[] = payload.blocks
          draft.entitySuggestionCache = draft.entitySuggestionCache || {}
          blocks.forEach(block => {
            draft.entitySuggestionCache[block.text.textValue.toLowerCase()] = block
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
          trimLeft(draft.blocks[state.selection.focus.index]?.text) ||
          trimRight(draft.blocks[state.selection.focus.index]?.text)
        ) {
          draft.operations.push({
            index: state.selection.focus.index,
            block: blockValue(draft.blocks[state.selection.focus.index]),
          })
        }

        // if there are any empty lines in the block, split it into two
        //   by setting the `insertBefore` bit on the operation
        if (splitBlockAtEmptyLine({ draft, atIndex: state.selection.focus.index })) {
          draft.operations.push({
            index: state.selection.focus.index,
            block: blockValue(draft.blocks[state.selection.focus.index]),
          })
          draft.operations.push({
            index: state.selection.focus.index + 1,
            block: blockValue(draft.blocks[state.selection.focus.index + 1]),
            insertBefore: true
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
        ) && !_selectedBlock.text.textValue.match(`\n`)
        _selectedBlock.__showTopicMenu = _selectedBlock.text.textValue.startsWith(
          '#'
        ) && !_selectedBlock.text.textValue.match(`\n`)


        // // if currently in an inline atomic
        // if(!(_selectedBlock.__showInlineTopicMenu || _selectedBlock.__showInlineCitationMenu)){






        // // get if inline was active in the last pass
        // _selectedBlock.__activeInline = (_selectedBlock.__showInlineTopicMenu || _selectedBlock.__showInlineCitationMenu)

        // const _currentWord = getWordFromOffset({text: _selectedBlock.text.textValue, offset: draft.selection.anchor.offset})

        // // show __showInlineCitationMenu if selection is collapsed, selection is within text precedded with a `@` and it is currently not tagged already  
        // _selectedBlock.__showInlineCitationMenu = (!selectionHasRange(draft.selection) && !_selectedBlock.__showCitationMenu && _currentWord?.word.startsWith(
        //   '@'
        // ) )?_currentWord: false

        // check if selected block has range type 'inlineAtomicMenu'
        const _hasInlineMenuMark = _selectedBlock.text.ranges.reduce((acc, curr) => {
          if (acc === true) {
            return true
          }
          if (curr.marks.includes('inlineAtomicMenu')) {
            return true
          }
          return false
        }, false)


        // show __showInlineTopicMenu if selection is collapsed, selection is within text precedded with a `#` and it is currently not tagged already
        _selectedBlock.__showInlineTopicMenu = !selectionHasRange(draft.selection) && _hasInlineMenuMark

         

        // _selectedBlock.__showInlineTopicMenu = (!selectionHasRange(draft.selection) && !_selectedBlock.__showTopicMenu && _currentWord?.word.startsWith('#') )?_currentWord: false
        




        // }


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