import React from 'react'
import {
  SearchAllLoader,
  AuthorsLoader,
  SourceCitationsLoader,
} from '@databyss-org/ui/components/Loaders'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
import SourceSvg from '@databyss-org/ui/assets/source.svg'
import {
  sortEntriesAtoZ,
  filterEntries,
  createSidebarListItems,
} from '@databyss-org/services/entries/util'

import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'

const SidebarSearchResults = ({ filterQuery, height }) => (
  <SearchAllLoader>
    {results => {
      debugger
      const sourceData = Object.values(results).map(value =>
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
  </SearchAllLoader>
)

export default SidebarSearchResults
