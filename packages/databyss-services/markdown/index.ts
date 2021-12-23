// import html2md from 'html-to-markdown'
import { textToMarkdown } from '../blocks/serialize'
import {
  CitationOutputTypes,
  CitationStyle,
  StyleTypeId,
} from '../citations/constants'
import { formatCitation, pruneCitation, toJsonCsl } from '../citations/lib'
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

export async function sourceToMarkdown({
  source,
  citationStyle,
}: {
  source: Source
  citationStyle: CitationStyle
}) {
  let md = `# ${source.text.textValue}\n\n`
  md += `### Citation (${citationStyle.shortName})\n\n`

  const csl = toJsonCsl(source.detail)
  const citation = html2md(
    await formatCitation(csl, {
      styleId: citationStyle.id,
      outputType: CitationOutputTypes.BIBLIOGRAPHY,
    })
  )
  md += `${citation}\n\n`
  const bibtex = await formatCitation(csl, {
    outputType: CitationOutputTypes.BIBTEX,
  })
  md += `### Citation (BibTeX)\n\n\`\`\`bibtex\n${bibtex.trim()}\n\`\`\`\n`
  return md
}

export function html2md(html: string) {
  return (
    html
      // <i>, <em> => _
      .replaceAll(/<\/?(i|em)>/gi, '_')
      // <b>, <strong> => **
      .replaceAll(/<\/?(b|strong)>/gi, '**')
      // strip remaining html
      .replaceAll(/<\/?.+?>/g, '')
      .trim()
  )
}
