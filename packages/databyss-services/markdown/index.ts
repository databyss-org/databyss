import { textToMarkdown } from '../blocks/serialize'
import { CitationOutputTypes, CitationStyle } from '../citations/constants'
import { formatCitation, toJsonCsl } from '../citations/lib'
import {
  Block,
  BlockType,
  Document,
  DocumentDict,
  Source,
  AuthorName,
  BibliographyItem,
} from '../interfaces'
import {
  composeAuthorName,
  sortBibliography,
  filterBibliographyByAuthor,
} from '../sources/lib'

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
      if (!_source) {
        return `## [[s/MISSING REF]]`
      }
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

export function bibliographyToMarkdown({
  bibliography,
  author,
  citationStyle,
}: {
  bibliography: BibliographyItem[]
  author?: AuthorName
  citationStyle?: CitationStyle
}) {
  let md = '# '
  if (author) {
    md += composeAuthorName(author.firstName, author.lastName)
  } else {
    md += 'Bibliography'
  }
  if (citationStyle) {
    md += ` (${citationStyle.shortName})`
  }
  md += '\n\n'
  let items = sortBibliography(bibliography)
  if (author) {
    items = filterBibliographyByAuthor({ items, author })
  }
  md += items
    .map((item) =>
      item.citation ? html2md(item.citation) : item.source.text.textValue
    )
    .join('\n\n')

  return md
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

  if (csl) {
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
  }

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
