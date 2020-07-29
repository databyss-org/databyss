import _ from 'lodash'
import { Block, BlockType, Selection, EditorState } from '../interfaces'

export const splice = (src, idx, rem, str) =>
  src.slice(0, idx) + str + src.slice(idx + Math.abs(rem))

export const isAtomicInlineType = (type: BlockType) => {
  switch (type) {
    case BlockType.Source:
      return true
    case BlockType.Topic:
      return true
    case BlockType.EndTopic:
      return true
    case BlockType.EndSource:
      return true
    default:
      return false
  }
}

export const isAtomic = (block: Block) => isAtomicInlineType(block.type)
export const isEmpty = (block: Block) => block.text.textValue.length === 0

// returns an array of indicies covered by selection
export const getSelectedIndicies = (selection: Selection) =>
  _.range(selection.anchor.index, selection.focus.index + 1)

export const withMetaData = (state: EditorState) => ({
  ...state,
  newEntities: [],
  operations: [],
})
