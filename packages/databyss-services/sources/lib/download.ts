import fileDownload from 'js-file-download'
import {
  bibliographyToMarkdown,
  cleanFilename,
  sourceToMarkdown,
} from '../../markdown'
import { Source, AuthorName, BibliographyItem } from '../../interfaces'
import { getCitationStyle } from '../../citations/lib'
import { CitationStyle } from '../../citations/constants'

export const downloadBibliography = async ({
  items,
  author,
  styleId,
}: {
  items: BibliographyItem[]
  author: AuthorName
  styleId?: string
}) => {
  fileDownload(
    bibliographyToMarkdown({
      bibliography: items,
      author,
      ...(styleId ? { citationStyle: getCitationStyle(styleId) } : {}),
    }),
    author
      ? `bibliography (${cleanFilename(
          author.lastName ?? author.firstName ?? ''
        )}).md`
      : 'bibliography.md'
  )
}

export const downloadSourceMarkdown = async ({
  source,
  styleId,
}: {
  source: Source
  styleId: string
}) => {
  const _sourcemd = await sourceToMarkdown({
    source,
    citationStyle: getCitationStyle(styleId) as CitationStyle,
  })
  const _filename = cleanFilename(source.text.textValue)
  fileDownload(_sourcemd, `${_filename}.md`)
}
