import React from 'react'
import { GroupHeadersLoader } from '@databyss-org/ui/components/Loaders'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'

const Groups = (others) => (
  <GroupHeadersLoader>
    {(groups) => <SidebarList menuItems={groups} {...others} />}
  </GroupHeadersLoader>
)

export default Groups
