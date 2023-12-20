import { mergeText } from '@databyss-org/services/text/mergeText'
import { Block, Text } from '../../interfaces'
import { splitTextAtOffset } from './'

// inserts @text into @block at @offset
// NOTE: modifies in place, so @block should be a draft
export default ({
  block,
  text,
  offset,
}: {
  block: Block
  text: Text
  offset: number
}): void => {
  const splitText = splitTextAtOffset({
    text: block.text,
    offset,
  })

  block.text = mergeText(mergeText(splitText.before, text), splitText.after)
}
