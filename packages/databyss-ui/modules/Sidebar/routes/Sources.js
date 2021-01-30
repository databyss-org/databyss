import React from 'react'
import { sortEntriesAtoZ } from '@databyss-org/services/entries/util'
import {
  AuthorsLoader,
  SourceCitationsLoader,
} from '@databyss-org/ui/components/Loaders'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'
import LoadingFallback from '@databyss-org/ui/components/Notify/LoadingFallback'
import { useBlockRelations, useBlocks } from '@databyss-org/data/pouchdb/hooks'
import { BlockType } from '@databyss-org/editor/interfaces'
import { getAuthorsFromSources } from '@databyss-org/services/lib/util'
import { joinBlockRelationsWithBlocks } from '@databyss-org/services/blocks'

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

<<<<<<< HEAD
const Authors = ({ filterQuery, hasIndexPage, height }) => {
  const sourcesRes = useBlocks(BlockType.Source)
  const blockRelationsRes = useBlockRelations(BlockType.Source)

  if (!blockRelationsRes.isSuccess || !sourcesRes.isSuccess) {
    return <LoadingFallback />
  }

  const sources = joinBlockRelationsWithBlocks(
    blockRelationsRes.data,
    sourcesRes.data
  )

  const authors = getAuthorsFromSources(sources)

  const authorData = getAuthorData(authors)
  const sortedAuthors = sortEntriesAtoZ(authorData, 'text')
  const filteredEntries = filterEntries(sortedAuthors, filterQuery)

  return (
    <SidebarList
      query
      menuItems={[
        ...(hasIndexPage ? sourcesOverview : ''),
        ...(filterQuery.textValue === '' ? sortedAuthors : filteredEntries),
      ]}
      height={height}
    />
  )
}
=======
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
>>>>>>> paul/collections-ui

export default Authors
