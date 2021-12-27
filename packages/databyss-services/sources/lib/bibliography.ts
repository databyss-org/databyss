import { AuthorName, BibliographyItem, Source } from '../../interfaces'
import { isCurrentAuthor } from './isCurrentAuthor'

export function sortBibliography(items: BibliographyItem[]) {
  const getSortablePart = (source: Source) =>
    // if author(s) exist, sort by last name (or first if no last)
    source.detail?.authors?.length
      ? source.detail.authors[0].lastName?.textValue ??
        source.detail.authors[0].firstName?.textValue
      : // otherwise sort by textValue
        source.text.textValue

  return items.sort((a, b) =>
    getSortablePart(a.source).toLowerCase() >
    getSortablePart(b.source).toLowerCase()
      ? 1
      : -1
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
