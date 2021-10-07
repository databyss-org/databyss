import { textToMarkdown } from '../blocks/serialize'
import { Block, BlockType, Source } from '../interfaces'

export function blockToMarkdown({
  block,
  linkedBlocks,
}: {
  block: Block
  linkedBlocks?: { [id: string]: Block }
}) {
  switch (block.type) {
    case BlockType.Topic: {
      return `# [[t/${block.text.textValue}]]`
    }
    case BlockType.Source: {
      const _shortName = (linkedBlocks![block._id] as Source).name?.textValue
      return `# [[s/${_shortName}]]`
    }
    case BlockType.EndTopic: {
      return `[/t/${block.text.textValue.substr(3)}]`
    }
    case BlockType.EndSource: {
      return `[/s/${block.text.textValue.substr(3)}]`
    }
  }
  return textToMarkdown(block.text)
}
