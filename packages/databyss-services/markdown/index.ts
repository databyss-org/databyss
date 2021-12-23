import { textToMarkdown } from '../blocks/serialize'
import { CitationOutputTypes, CitationStyle } from '../citations/constants'
import { formatCitation, toJsonCsl } from '../citations/lib'
import { Block, BlockType, Document, DocumentDict, Source } from '../interfaces'

export function blockToMarkdown({
  block,
  linkedDocs,
  isTitle,
}: {
  block: Block
  linkedDocs?: DocumentDict<Document>
  isTitle: boolean
}) {
  const _c = cleanFilename

  switch (block.type) {
    case BlockType.Topic: {
      return `## [[t/${_c(block.text.textValue)}]]`
    }
    case BlockType.Source: {
      const _source = linkedDocs![block._id] as Source
      const _shortName = _source.name?.textValue ?? _source.text.textValue
      return `## [[s/${_c(_shortName)}]]`
    }
    case BlockType.EndTopic: {
      return `[/t/${_c(block.text.textValue.substr(3))}]`
    }
    case BlockType.EndSource: {
      return `[/s/${_c(block.text.textValue.substr(3))}]`
    }
  }
  const _md = textToMarkdown(block.text, linkedDocs)
  return isTitle ? `# ${_md}` : _md
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

export function cleanFilename(filename: string) {
  return filename.replaceAll(/[^\p{L}\p{N}_\- ]/gu, '').trim()
}
