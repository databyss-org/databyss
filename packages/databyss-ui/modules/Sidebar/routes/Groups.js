import React from 'react'
import { GroupHeadersLoader } from '@databyss-org/ui/components/Loaders'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'

export const getGroupItems = (groupHeaders) =>
  Object.values(groupHeaders).map((header) => ({
    text: header.name,
    type: 'group',
    route: `/collections/${header._id}`,
  }))

const Groups = (others) => (
  <GroupHeadersLoader>
    {(groupHeaders) => (
      <SidebarList menuItems={getGroupItems(groupHeaders)} {...others} />
    )}
  </GroupHeadersLoader>
)

export default Groups
