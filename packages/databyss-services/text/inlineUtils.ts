import { InlineTypes } from '../interfaces/Range'
import { Block, BlockType, Text } from '../interfaces'
import { splitTextAtOffset } from './splitTextAtOffset'
import { mergeText } from './mergeText'

export const atomicTypeToSymbol = (type: BlockType): string => {
  const getSymbolObj = {
    [BlockType.Source]: '@',
    [BlockType.Topic]: '#',
    [BlockType.Link]: '',
    [BlockType.Embed]: '',
  }

  const symbol = getSymbolObj[type]

  return symbol
}

export const inlineTypeToSymbol = (inlineType: InlineTypes): string => {
  const getType = {
    [InlineTypes.InlineSource]: BlockType.Source,
    [InlineTypes.InlineTopic]: BlockType.Topic,
    [InlineTypes.Embed]: BlockType.Embed,
    [InlineTypes.Link]: BlockType.Link,
  }
  const type = getType[inlineType]

  return atomicTypeToSymbol(type)
}

export const replaceInlineText = ({
  text,
  refId,
  newText,
  type,
}: {
  text: Text
  refId: string
  newText: Text
  type: InlineTypes
}): Text | null => {
  const _symbol = inlineTypeToSymbol(type)

  const _isEmbed = type === InlineTypes.Embed

  let _textToInsert: null | Text = null
  if (!_isEmbed) {
    _textToInsert = {
      textValue: `${_symbol}${newText.textValue}`,
      ranges: [
        {
          length: newText.textValue.length + 1,
          offset: 0,
          marks: [[type, refId]],
        },
      ],
    } as Text
  } else {
    // replace embed text
    _textToInsert = {
      textValue: `[${newText.textValue}]`,
      ranges: [
        {
          length: newText.textValue.length + 2,
          offset: 0,
          marks: [[type, refId]],
        },
      ],
    } as Text
  }

  const _rangesWithId = text.ranges.filter(
    (r) => r.marks[0][0] === type && r.marks[0][1] === refId
  )

  // offset will be updated in loop
  let _cumulativeOffset = 0
  let _textToUpdate = text
  _rangesWithId.forEach((r) => {
    const _splitText = splitTextAtOffset({
      text: _textToUpdate,
      offset: r.offset + _cumulativeOffset,
    })

    // remove text from second half of split
    const _textAfter = splitTextAtOffset({
      text: _splitText.after,
      offset: r.length,
    })

    // insert text at offset
    let _mergedText = mergeText(_splitText.before, _textToInsert!)

    // merge last half of text with new next
    _mergedText = mergeText(_mergedText, _textAfter.after)

    // update cumulative text
    _textToUpdate = _mergedText

    // update offset to current offset
    // get difference of previous atomic to new atomic to update length of the atomic
    const _diff = _textToInsert!.textValue.length - r.length
    _cumulativeOffset += _diff
  })
  if (_rangesWithId.length) {
    return _textToUpdate
  }
  return null
}

export const updateInlinesInBlock = ({
  block,
  inlineType,
  text,
  inlineId,
}: {
  block: Block
  inlineType: InlineTypes
  text: Text
  inlineId: string
}) => {
  // console.log('[updateInlinesInBlock]', block, inlineType, text, inlineId)
  // get all inline ranges from block
  const _inlineRanges = block!.text.ranges.filter(
    (r) => r.marks.filter((m) => m.includes(inlineType)).length
  )

  // eslint-disable-next-line no-loop-func
  for (const r of _inlineRanges) {
    // if inline range matches the ID, update block
    if (r.marks[0].length === 2) {
      const _inlineMark = r.marks[0]
      const _inlineId = _inlineMark[1]
      if (_inlineId === inlineId) {
        const _newText = replaceInlineText({
          text: block!.text,
          refId: inlineId,
          newText: text,
          type: inlineType,
        })
        // console.log('[updateInlines] new Text', _newText)
        return Object.assign({}, block!, { text: _newText })
      }
    }
  }
  return null
}
