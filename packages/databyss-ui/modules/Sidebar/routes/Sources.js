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
  },
  {
    type: 'authors',
    text: 'All authors',
  },
]

const Sources = ({ filterQuery }) => (
  <AuthorsLoader>
    {authors => {
      const authorData = Object.values(authors).map(value => {
        const shortFirstName = value.firstName?.textValue.charAt(0)
        const lastName = value.lastName?.textValue
        return {
          text: `${lastName}${shortFirstName && `, ${shortFirstName}.`}`,
          type: 'authors',
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
