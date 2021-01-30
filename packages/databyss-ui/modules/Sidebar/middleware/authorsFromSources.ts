import { Author, Source } from '@databyss-org/services/interfaces'
import { SidebarListItem } from '@databyss-org/ui/components'

export const mapAuthorData = (authors: Author[]): SidebarListItem[] =>
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
    }
  })

export const authorsFromSources = (blocks: Source[]) =>
  mapAuthorData(
    Object.values(
      blocks.reduce((dict, block) => {
        if (block.detail?.authors) {
          block.detail.authors.forEach((author) => {
            dict[
              `${author.firstName?.textValue || ''}${
                author.lastName?.textValue || ''
              }`
            ] = author
          })
        }
        return dict
      }, {})
    )
  )
