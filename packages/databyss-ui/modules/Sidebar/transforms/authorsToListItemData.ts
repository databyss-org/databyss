import { Author, Source } from '@databyss-org/services/interfaces'
import { SidebarListItemData } from '@databyss-org/ui/components'

export interface AuthorWithStats extends Author {
  modifiedAt: number | undefined
  createdAt: number | undefined
  accessedAt: number | undefined
}

export const mapAuthorData = (
  authors: AuthorWithStats[]
): SidebarListItemData<any>[] =>
  authors.map((value) => {
    const firstName = value.firstName?.textValue
    const lastName = value.lastName?.textValue
    const shortFirstName = `${
      lastName ? `${firstName?.charAt(0)}.` : firstName
    }`

    const getShortAuthorName = () => {
      if (lastName && firstName) {
        return `${lastName}, ${shortFirstName}`
      }
      return lastName || shortFirstName
    }

    const authorParams = new URLSearchParams({
      firstName: encodeURIComponent(firstName || ''),
      lastName: encodeURIComponent(lastName || ''),
    })

    return {
      text: getShortAuthorName(),
      type: 'author',
      route: `/sources?${authorParams.toString()}`,
      data: value,
    }
  })

const maxOrUndefined = (a: number | undefined, b: number | undefined) => {
  if (typeof a === 'undefined' && typeof b === 'undefined') {
    return undefined
  }
  return Math.max(a ?? 0, b ?? 0)
}

export const authorsToListItemData = (blocks: Source[]) =>
  mapAuthorData(
    Object.values(
      blocks.reduce((dict: { [name: string]: AuthorWithStats }, block) => {
        if (block.detail?.authors) {
          block.detail.authors.forEach((author) => {
            const _authorKey = `${author.firstName?.textValue || ''}${
              author.lastName?.textValue || ''
            }`
            if (!dict[_authorKey]) {
              dict[_authorKey] = {
                ...author,
                createdAt: (block as any).createdAt,
                modifiedAt: (block as any).modifiedAt,
                accessedAt: (block as any).accessedAt,
              }
            }
            const _authorWithStats = dict[_authorKey]
            dict[_authorKey] = {
              ...author,
              createdAt: maxOrUndefined(
                _authorWithStats.createdAt,
                (block as any).createdAt
              ),
              modifiedAt: maxOrUndefined(
                _authorWithStats.modifiedAt,
                (block as any).modifiedAt
              ),
              accessedAt: maxOrUndefined(
                _authorWithStats.accessedAt,
                (block as any).accessedAt
              ),
            }
          })
        }
        return dict
      }, {})
    )
  )
