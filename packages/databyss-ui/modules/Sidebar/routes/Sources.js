import React, { useEffect } from 'react'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { EntrySearchLoader } from '@databyss-org/ui/components/Loaders'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
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

const Sources = () => {
  const { getAllSources, state } = useSourceContext()
  useEffect(() => getAllSources(), [])

  const sourcesData = () =>
    Object.entries(state.cache).map(([, value]) => {
      const author = value.authors[0]

      return {
        id: value._id,
        type: 'authors',
        text: author
          ? `${author.lastName.textValue}, ${author.firstName.textValue}`
          : 'Unknown author',
        icon: <AuthorSvg />,
      }
    })

  const sortedSources = sourcesData().sort((a, b) => (a.text > b.text ? 1 : -1))

  return <SidebarList menuItems={[...sourcesOverview, ...sortedSources]} />
}

export default Sources
