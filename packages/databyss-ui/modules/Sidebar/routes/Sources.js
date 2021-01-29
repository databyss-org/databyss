import React from 'react'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
import SourceSvg from '@databyss-org/ui/assets/source.svg'
import {
  sortEntriesAtoZ,
  filterEntries,
  createSidebarListItems,
} from '@databyss-org/services/entries/util'
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
  Object.values(sources).map((value) =>
    createSidebarListItems({
      text: value.text.textValue,
      type: 'sources',
      route: '/sources',
      id: value._id,
      params: value._id,
      icon: <SourceSvg />,
    })
  )

export const SourceTitles = ({ filterQuery, height }) => {
  const sourcesRes = useBlocks(BlockType.Source)
  const blockRelationsRes = useBlockRelations(BlockType.Source)

  if (!blockRelationsRes.isSuccess || !sourcesRes.isSuccess) {
    return <LoadingFallback />
  }

  const sources = Object.values(
    Object.values(blockRelationsRes.data).reduce((_sources, _relation) => {
      _sources[_relation.relatedBlock] = sourcesRes.data[_relation.relatedBlock]
      return _sources
    }, {})
  )

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
}

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

    return createSidebarListItems({
      text: getShortAuthorName(),
      type: 'authors',
      route: '/sources',
      params: authorParams.toString(),
      icon: <AuthorSvg />,
    })
  })

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

export default Authors
