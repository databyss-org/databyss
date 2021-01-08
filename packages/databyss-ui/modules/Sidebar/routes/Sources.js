import React from 'react'
import { sortEntriesAtoZ } from '@databyss-org/services/entries/util'
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

export const getSourceTitlesData = (sources) =>
  Object.values(sources).map((value) => ({
    text: value.text.textValue,
    type: 'source',
    route: `/sources${value._id}`,
  }))

export const SourceTitles = (others) => (
  <SourceCitationsLoader>
    {(sources) => (
      <SidebarList
        menuItems={sortEntriesAtoZ(getSourceTitlesData(sources), 'text')}
        {...others}
      />
    )}
  </SourceCitationsLoader>
)

export const getAuthorData = (authors) =>
  Object.values(authors).map((value) => {
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

const Authors = ({ hasIndexPage, ...others }) => (
  <SourceCitationsLoader>
    {() => (
      <AuthorsLoader filtered>
        {(authors) => (
          <SidebarList
            query
            menuItems={[
              ...(hasIndexPage ? sourcesOverview : ''),
              ...sortEntriesAtoZ(getAuthorData(authors), 'text'),
            ]}
            {...others}
          />
        )}
      </AuthorsLoader>
    )}
  </SourceCitationsLoader>
)

export default Authors
