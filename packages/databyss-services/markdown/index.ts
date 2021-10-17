import { textToMarkdown } from '../blocks/serialize'
import { Block, BlockType, Document, DocumentDict, Source } from '../interfaces'

export function blockToMarkdown({
  block,
  linkedDocs,
}: {
  block: Block
  linkedDocs?: DocumentDict<Document>
}) {
  switch (block.type) {
    case BlockType.Topic: {
      return `# [[t/${block.text.textValue}]]`
    }
    case BlockType.Source: {
      const _shortName = (linkedDocs![block._id] as Source).name?.textValue
      return `# [[s/${_shortName}]]`
    }
    case BlockType.EndTopic: {
      return `[/t/${block.text.textValue.substr(3)}]`
    }
    case BlockType.EndSource: {
      return `[/s/${block.text.textValue.substr(3)}]`
    }
  }
  return textToMarkdown(block.text, linkedDocs)
}
