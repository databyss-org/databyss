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

export const getSourceTitlesData = sources =>
  Object.values(sources).map(value =>
    createSidebarListItems({
      text: value.text.textValue,
      type: 'sources',
      route: '/sources',
      id: value._id,
      params: value._id,
      icon: <SourceSvg />,
    })
  )

export const SourceTitles = ({ filterQuery, height }) => (
  <SourceCitationsLoader>
    {sources => {
      const sourceData = getSourceTitlesData(sources)
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

export const getAuthorData = authors =>
  Object.values(authors).map(value => {
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
      // TODO remove replace statement
      params: authorParams.toString().replace('25', ''),
      icon: <AuthorSvg />,
    })
  })

const Authors = ({ filterQuery, hasIndexPage, height }) => (
  <SourceCitationsLoader>
    {() => (
      <AuthorsLoader>
        {authors => {
          const authorData = getAuthorData(authors)
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
