import React from 'react'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
import {
  sortEntriesAtoZ,
  filterEntries,
  createSidebarListItems,
} from '@databyss-org/services/entries/util'
import {
  AuthorsLoader,
  SourceCitationsLoader,
} from '@databyss-org/ui/components/Loaders'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'

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
  <SourceCitationsLoader>
    {() => (
      <AuthorsLoader>
        {authors => {
          const authorData = Object.values(authors).map(value => {
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
              author_first: encodeURIComponent(firstName || ''),
              author_last: encodeURIComponent(lastName || ''),
            })

            return createSidebarListItems({
              text: getShortAuthorName(),
              type: 'authors',
              route: '/sources',
              params: authorParams.toString(),
              icon: <AuthorSvg />,
            })
          })

          const sortedAuthors = sortEntriesAtoZ(authorData, 'text')
          const filteredEntries = filterEntries(sortedAuthors, filterQuery)

          return (
            <SidebarList
              menuItems={[
                ...sourcesOverview,
                ...(filterQuery.textValue === ''
                  ? sortedAuthors
                  : filteredEntries),
              ]}
            />
          )
        }}
      </AuthorsLoader>
    )}
  </SourceCitationsLoader>
)

export default Sources
