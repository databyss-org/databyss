import React from 'react'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
import {
  sortEntriesAtoZ,
  filterEntries,
} from '@databyss-org/services/sources/util'
import { AuthorsLoader } from '@databyss-org/ui/components/Loaders'
import SidebarList from '../../../components/Sidebar/SidebarList'

const sourcesOverview = [
  {
    type: 'sources',
    text: 'All sources',
    route: '/sources',
  },
  {
    type: 'authors',
    text: 'All authors',
    route: '/sources/authors',
  },
]

const Sources = ({ filterQuery }) => (
  <AuthorsLoader>
    {authors => {
      const authorData = Object.values(authors).map(value => {
        const firstName = value.firstName?.textValue
        const shortFirstName = `${firstName?.charAt(0)}.`
        const lastName = value.lastName?.textValue

        // Remove whitespace and special characters from name and turn to lowercase
        const cleanNames = name => name.replace(/[^\w]/gi, '').toLowerCase()
        const authorParam = `${cleanNames(lastName)}-${cleanNames(firstName)}`

        return {
          text: `${lastName}${shortFirstName && `, ${shortFirstName}`}`,
          type: 'authors',
          route: '/sources/authors',
          id: authorParam,
          icon: <AuthorSvg />,
        }
      })
      const sortedAuthors = sortEntriesAtoZ(authorData, 'text')
      const filteredEntries = filterEntries(sortedAuthors, filterQuery)

      return (
        <SidebarList
          menuItems={[
            ...sourcesOverview,
            ...(filterQuery.textValue === '' ? sortedAuthors : filteredEntries),
          ]}
        />
      )
    }}
  </AuthorsLoader>
)

export default Sources
