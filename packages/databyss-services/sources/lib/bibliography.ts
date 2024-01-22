import { AuthorName, BibliographyItem, Source } from '../../interfaces'
import { isCurrentAuthor } from './isCurrentAuthor'

export function sortBibliography(items: BibliographyItem[]) {
  const getSortableAuthor = (source: Source) =>
    // if author(s) exist, sort by last name (or first if no last)
    source.detail?.authors?.length
      ? source.detail.authors[0].lastName?.textValue ??
        source.detail.authors[0].firstName?.textValue
      : ''

  const getSortableTitle = (source: Source) =>
    source.detail?.title?.textValue ?? ''
  const getSortableName = (source: Source) => source.name?.textValue ?? ''

  const getSortableValue = (source: Source) =>
    `${getSortableAuthor(source)} ${getSortableTitle(source)} ${getSortableName(
      source
    )} ${source.text.textValue}`
      .trim()
      .toLowerCase()

  return items.sort((a, b) =>
    getSortableValue(a.source) > getSortableValue(b.source) ? 1 : -1
  )
}

export function filterBibliographyByAuthor({
  items,
  author,
}: {
  items: BibliographyItem[]
  author: AuthorName
}) {
  return items.filter((s) =>
    isCurrentAuthor(s.source.detail?.authors, author.firstName, author.lastName)
  )
}
