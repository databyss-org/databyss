import cloneDeep from 'clone-deep'
import { Editor, Transforms } from '@databyss-org/slate'
import { ReactEditor } from '@databyss-org/slate-react'
import { RangeType } from '@databyss-org/services/interfaces'
import {
  BlockType,
  Source,
  Topic,
} from '@databyss-org/services/interfaces/Block'
import { mergeText } from '@databyss-org/services/text/mergeText'
import { atomicTypeToSymbol } from '@databyss-org/services/text/inlineUtils'
import { EditorState } from '../../interfaces/EditorState'
import {
  getTextOffsetWithRange,
  atomicTypeToInlineRangeType,
} from '../../state/util'
import { splitTextAtOffset } from '../clipboardUtils/index'

export const onBakeInlineAtomic = ({
  editor,
  state,
  suggestion,
  setContent,
}: {
  editor: ReactEditor & Editor
  suggestion: Source & Topic
  state: EditorState
  setContent: Function
}) => {
  // compose new block with inline atomic id
  const _index = state.selection.anchor.index
  const _stateBlock = state.blocks[_index]

  // replace inner text with updated atomic
  const _markupTextValue = getTextOffsetWithRange({
    text: _stateBlock.text,
    rangeType: RangeType.InlineAtomicInput,
  })

  // get value before offset
  let _textBefore = splitTextAtOffset({
    text: _stateBlock.text,
    offset: _markupTextValue!.offset,
  }).before

  // get value after markup range
  const _textAfter = splitTextAtOffset({
    text: _stateBlock.text,
    offset: _markupTextValue!.offset + _markupTextValue!.length,
  }).after

  // merge first block with topic value, add mark and id to second block

  // if suggestion is a source, use short name
  let _suggestionText = suggestion.text

  if (suggestion.type === BlockType.Source && suggestion?.name) {
    _suggestionText = suggestion.name
  }
  _textBefore = mergeText(_textBefore, {
    textValue: `${atomicTypeToSymbol(suggestion.type)}${
      _suggestionText.textValue
    }`,
    ranges: [
      {
        offset: 0,
        length: _suggestionText.textValue.length + 1,
        marks: [[atomicTypeToInlineRangeType(suggestion.type), suggestion._id]],
      },
    ],
  })

  // get the offset value where the cursor should be placed after operation
  const _caretOffest = _textBefore.textValue.length

  // merge second block with first block
  const _newText = mergeText(_textBefore, _textAfter)

  // create a new block with updated ranges
  const _newBlock = {
    ..._stateBlock,
    text: _newText,
  }

  // toggle editor to remove active 'inlineAtomicMenu'
  Editor.removeMark(editor, 'inlineAtomicMenu')

  // update the selection
  const _sel = cloneDeep(state.selection)
  _sel.anchor.offset = _caretOffest
  _sel.focus.offset = _caretOffest

  setContent({
    selection: _sel,
    operations: [
      {
        index: _index,
        text: _newBlock.text,
        withRerender: true,
      },
    ],
  })
  // Slate editor needs to retrigger current position
  Transforms.move(editor, {
    unit: 'character',
    distance: 1,
    reverse: true,
  })
  Transforms.move(editor, {
    unit: 'character',
    distance: 1,
  })
}
