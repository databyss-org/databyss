import React, { useEffect } from 'react'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
import { uniqBy } from 'lodash'
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
    Object.values(state.cache).map(value => {
      const author = value.authors?.[0]
      const firstName = author?.firstName?.textValue
      const lastName = author?.lastName?.textValue

      return {
        id: value._id,
        type: 'authors',
        text: author && `${lastName}${firstName && `, ${firstName}`}`,
        icon: <AuthorSvg />,
      }
    })

  const sortedSources = sourcesData().sort((a, b) => (a.text > b.text ? 1 : -1))
  // remove duplicate values
  const uniqueAuthorList = uniqBy(sortedSources, 'text')

  return <SidebarList menuItems={[...sourcesOverview, ...uniqueAuthorList]} />
}

export default Sources
