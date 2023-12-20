import { mergeText } from '@databyss-org/services/text/mergeText'
import { splitTextAtOffset } from '@databyss-org/services/text/splitTextAtOffset'
import { Text } from '../../interfaces'

// returns text value of inserted text and new offset position
export default ({
  text,
  offset,
  textToInsert,
}: {
  text: Text
  offset: number
  textToInsert: Text
}): {
  text: Text
  offsetAfterInsert: number
} => {
  if (!textToInsert?.textValue) {
    return { text, offsetAfterInsert: offset }
  }
  let _offset = textToInsert.textValue.length
  const { before, after } = splitTextAtOffset({
    text,
    offset,
  })
  const _beforeText = mergeText(before, textToInsert)

  _offset = _beforeText.textValue.length

  const _newText = mergeText(_beforeText, after)
  return {
    text: _newText,
    offsetAfterInsert: _offset,
  }
}
