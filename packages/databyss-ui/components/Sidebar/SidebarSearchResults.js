import React from 'react'
import { SearchAllLoader } from '@databyss-org/ui/components/Loaders'
import {
  sortEntriesAtoZ,
  filterEntries,
} from '@databyss-org/services/entries/util'
import {
  getAuthorData,
  getSourceTitlesData,
} from '@databyss-org/ui/modules/Sidebar/routes/Sources'
import { getPagesData } from '@databyss-org/ui/modules/Sidebar/routes/Pages'
import { getTopicsData } from '@databyss-org/ui/modules/Sidebar/routes/Topics'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'

const SidebarSearchResults = ({ filterQuery, height }) => (
  <SearchAllLoader>
    {results => {
      const sourceTitlesData = getSourceTitlesData(results.sourceCitations)
      const pagesData = getPagesData(results.pages)
      const authorsData = getAuthorData(results.authors)
      const topicsData = getTopicsData(results.topics)

      const allResults = [
        ...sourceTitlesData,
        ...pagesData,
        ...authorsData,
        ...topicsData,
      ]

      const sortedSources = sortEntriesAtoZ(allResults, 'text')
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
