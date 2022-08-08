import { Author, Source } from '@databyss-org/services/interfaces'
import { SidebarListItemData } from '@databyss-org/ui/components'

export interface AuthorWithStats extends Author {
  modifiedAt: number
  createdAt: number
  accessedAt: number
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
              createdAt: Math.max(
                _authorWithStats.createdAt ?? 0,
                (block as any).createdAt ?? 0
              ),
              modifiedAt: Math.max(
                _authorWithStats.modifiedAt ?? 0,
                (block as any).modifiedAt ?? 0
              ),
              accessedAt: Math.max(
                _authorWithStats.accessedAt ?? 0,
                (block as any).accessedAt ?? 0
              ),
            }
          })
        }
        return dict
      }, {})
    )
  )
