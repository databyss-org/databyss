import { EditorState, Block } from '../../interfaces'
import {
  isSelectionCollapsed,
  sortSelection,
  splitTextAtOffset,
  fragmentId,
  addBlockUIFields,
} from './'
import { isAtomicInlineType } from '../util'

// returns fragment in state selection
export default (state: EditorState): Block[] => {
  if (isSelectionCollapsed(state.selection)) {
    return []
  }

  let frag: Block[] = []

  const { blocks, selection } = state

  const { anchor, focus } = sortSelection(selection)

  // if selection is within the same block
  if (anchor.index === focus.index) {
    const _selectionLength = focus.offset - anchor.offset
    const _block = blocks[anchor.index]
    // split block at anchor offset and use `after`
    const _firstTextSplit = isAtomicInlineType(_block.type)
      ? _block.text
      : splitTextAtOffset({
          text: _block.text,
          offset: anchor.offset,
        }).after

    // split block at length of selection and get `before`
    const _secondTextSplit = isAtomicInlineType(_block.type)
      ? _block.text
      : splitTextAtOffset({
          text: _firstTextSplit || _block.text,
          offset: _selectionLength,
        }).before

    // if text frag has no `second split` use the first split (whole block was selected)
    const _textFrag = _secondTextSplit || _firstTextSplit

    if (_textFrag) {
      frag.push({
        text: _textFrag,
        type: _block.type,
        _id: fragmentId(_block.type, _block._id),
      })
    }
  }

  // if selection is more than one block
  if (anchor.index < focus.index) {
    blocks.forEach((block: Block, index: number) => {
      // first block
      if (index === anchor.index) {
        const { after: firstTextFrag } = isAtomicInlineType(block.type)
          ? { after: block.text }
          : splitTextAtOffset({
              text: block.text,
              offset: anchor.offset,
            })

        if (firstTextFrag) {
          frag.push({
            text: firstTextFrag,
            type: block.type,
            _id: fragmentId(block.type, block._id),
          })
        }
      }
      // get in between frags
      else if (index > anchor.index && index < focus.index) {
        const _sliceLength = focus.index - anchor.index
        if (_sliceLength > 1) {
          frag.push({
            text: block.text,
            type: block.type,
            _id: fragmentId(block.type, block._id),
          })
        }
      }

      // last block
      else if (index === focus.index) {
        const { before: lastTextFrag } = isAtomicInlineType(block.type)
          ? { before: block.text }
          : splitTextAtOffset({
              text: block.text,
              offset: focus.offset,
            })

        if (lastTextFrag) {
          frag.push({
            text: lastTextFrag,
            type: block.type,
            _id: fragmentId(block.type, block._id),
          })
        }
      }
    })
  }
  // add metadata
  frag = addBlockUIFields(frag)

  return frag
}
