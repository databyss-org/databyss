import { Text } from '../../interfaces'
import splitTextAtOffset from './splitTextAtOffset'
import { mergeText } from './index'

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
  let _offset = textToInsert.textValue.length
  console.log('text', text.ranges)
  const { before, after } = splitTextAtOffset({
    text,
    offset,
  })
  console.log(before)
  console.log('after', after)
  const _beforeText = mergeText(before, textToInsert)

  _offset = _beforeText.textValue.length

  const _newText = mergeText(_beforeText, after)
  return {
    text: _newText,
    offsetAfterInsert: _offset,
  }
}
