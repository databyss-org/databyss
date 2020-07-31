import { EditorState, Point, Block } from '../../interfaces'
import {
  isSelectionCollapsed,
  sortSelection,
  splitTextAtOffset,
  mergeText,
  makeEmptyBlock,
} from './'
import { isAtomicInlineType } from '../util'

// updates block with selection removed
const deleteSelectionWithinBlock = ({
  blocks,
  anchor,
  focus,
}: {
  blocks: Block[]
  anchor: Point
  focus: Point
}) => {
  console.log('deleteSelectionWithinBlock')
  const { index } = anchor
  const block = blocks[index]

  // if selection spans over entire block, delete block contents
  if (focus.offset - anchor.offset === block.text.textValue.length) {
    blocks[index] = makeEmptyBlock(block._id)
    return
  }

  // if block is atomic, delete block contents and reset id
  if (isAtomicInlineType(block.type)) {
    blocks[index] = makeEmptyBlock()
    return
  }

  // otherwise, split the text to remove selected range
  // we'll extract _beforeAnchor and  _afterFocus
  // and update block text to _beforeAnchor merged with _afterFocus
  // TODO: let Slate handle this?

  // split block at anchor offset to get before and _selected
  const { before: _beforeAnchor, after: _afterAnchor } = splitTextAtOffset({
    text: block.text,
    offset: anchor.offset,
  })

  // split _afterAnchor at focus.offset - anchor.offset
  const { after: _afterFocus } = splitTextAtOffset({
    text: _afterAnchor,
    offset: focus.offset - anchor.offset,
  })

  // update text in block to merged results
  block.text = mergeText(_beforeAnchor, _afterFocus)
}

// updates blocks with selected blocks removed
const deleteSelectionAcrossBlocks = ({
  blocks,
  anchor,
  focus,
}: {
  blocks: Block[]
  anchor: Point
  focus: Point
}) => {
  // after the delete, the anchor block should contain everything before the
  // anchor.offset in the anchor block merged with everything after the
  // focus.offset in the focus block

  // if anchor block is atomic, remove entire block and reset id
  if (isAtomicInlineType(blocks[anchor.index].type)) {
    blocks[anchor.index] = makeEmptyBlock()
  } else {
    // otherwise, split the text at the anchor offset
    const { before: _beforeAnchor } = splitTextAtOffset({
      text: blocks[anchor.index].text,
      offset: anchor.offset,
    })
    // and update anchor block text
    blocks[anchor.index].text = _beforeAnchor
  }

  // if focus block is atomic, we can just ignore it and let it get deleted entirely
  // otherwise, extract text after focus.offset and merge it into the anchor block text
  if (!isAtomicInlineType(blocks[focus.index].type)) {
    const { after: _afterFocus } = splitTextAtOffset({
      text: blocks[focus.index].text,
      offset: focus.offset,
    })
    blocks[anchor.index].text = mergeText(
      blocks[anchor.index].text,
      _afterFocus
    )
  }

  // remove all the the blocks in the selection except the anchor block
  blocks.splice(anchor.index + 1, focus.index - anchor.index)
}

export default (draft: EditorState) => {
  if (isSelectionCollapsed(draft.selection)) {
    return
  }

  const { selection, blocks } = draft
  const { anchor, focus } = sortSelection(selection)

  // check if selection is within a block
  if (focus.index === anchor.index) {
    deleteSelectionWithinBlock({ blocks, anchor, focus })
  } else {
    deleteSelectionAcrossBlocks({ blocks, anchor, focus })
    draft.operations.reloadAll = true
  }

  // collapse selection
  const _cursor = { offset: anchor.offset, index: anchor.index }
  draft.selection = {
    _id: draft.selection._id,
    anchor: _cursor,
    focus: _cursor,
  }

  // TODO: create operation for this mutation
}
