import React, { useEffect } from 'react'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
<<<<<<< HEAD
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
import {
  getSourcesData,
  sortEntriesAtoZ,
  filterEntries,
} from '@databyss-org/services/sources/util'
=======
import { EntrySearchLoader } from '@databyss-org/ui/components/Loaders'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
>>>>>>> Have list of individual authors in sidebar
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

const Sources = ({ filterQuery }) => {
  const { getAllSources, state } = useSourceContext()
  useEffect(() => getAllSources(), [])

  const sourcesData = getSourcesData(state.cache, 'authors', <AuthorSvg />)
  const sortedSources = sortEntriesAtoZ(sourcesData)
  const filteredEntries = filterEntries(sortedSources, filterQuery)

  return (
    <SidebarList
      menuItems={[
        ...sourcesOverview,
        ...(filterQuery.textValue === '' ? sortedSources : filteredEntries),
      ]}
    />
  )
}

export default Sources
