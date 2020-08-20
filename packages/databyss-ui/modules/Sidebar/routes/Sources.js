import React from 'react'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
import SourceSvg from '@databyss-org/ui/assets/source.svg'
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

export const SourceTitles = ({ filterQuery, height, LoadingFallback }) => (
  <SourceCitationsLoader LoadingFallback={LoadingFallback}>
    {sources => {
      const sourceData = Object.values(sources).map(value =>
        createSidebarListItems({
          text: value.text.textValue,
          type: 'sources',
          route: '/sources',
          id: value._id,
          params: value._id,
          icon: <SourceSvg />,
        })
      )
      const sortedSources = sortEntriesAtoZ(sourceData, 'text')
      const filteredEntries = filterEntries(sortedSources, filterQuery)

      return (
        <SidebarList
          menuItems={[
            ...(filterQuery.textValue === '' ? sortedSources : filteredEntries),
          ]}
          height={height}
        />
      )
    }}
  </SourceCitationsLoader>
)

const Authors = ({ filterQuery, hasIndexPage, height, LoadingFallback }) => (
  <SourceCitationsLoader LoadingFallback={LoadingFallback}>
    {() => (
      <AuthorsLoader LoadingFallback={LoadingFallback}>
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
              firstName: encodeURIComponent(firstName || ''),
              lastName: encodeURIComponent(lastName || ''),
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
              query
              menuItems={[
                ...(hasIndexPage ? sourcesOverview : ''),
                ...(filterQuery.textValue === ''
                  ? sortedAuthors
                  : filteredEntries),
              ]}
              height={height}
            />
          )
        }}
      </AuthorsLoader>
    )}
  </SourceCitationsLoader>
)

export default Authors
