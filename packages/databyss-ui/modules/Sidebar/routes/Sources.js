import React, { useEffect } from 'react'
import SidebarList from '../../../components/Sidebar/SidebarList'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { fetchSourceQuery } from '@databyss-org/services//sources/actions.js'

const menuItems = [
  {
    type: 'sources',
    text: 'All Sources',
  },
  {
    type: 'authors',
    text: 'All authors',
  },
]

const Sources = () => {
  const { getAllSources, state } = useSourceContext()
  useEffect(() => getAllSources(), [])
  useEffect(() => console.log(state), [state])
  console.log(state)
  return <SidebarList menuItems={menuItems} />
}

export default Sources
