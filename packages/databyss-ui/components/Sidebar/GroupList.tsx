import React from 'react'
import { GroupHeadersLoader } from '@databyss-org/ui/components/Loaders'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'

const getGroupItems = (groupHeaders) =>
  Object.values(groupHeaders).map((header) => ({
    text: header.name,
    type: 'group',
    route: `/collections/${header._id}`,
    data: header,
  }))

const getPageItems = (pageHeaders) =>
  Object.values(pageHeaders).map((header) => ({
    text: header.name,
    type: 'page',
    route: `/pages/${header._id}`,
    data: header,
  }))

export const GroupList = (others) => (
  <GroupHeadersLoader>
    {([groupHeaders, sharedPageHeaders]) => (
      <>
        <SidebarList
          menuItems={[
            {
              text: 'My Collections',
              type: 'heading',
            },
            ...getGroupItems(groupHeaders),
            {
              text: 'Shared Pages',
              type: 'heading',
            },
            ...getPageItems(sharedPageHeaders),
          ]}
          {...others}
        />
      </>
    )}
  </GroupHeadersLoader>
)
