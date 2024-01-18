import React from 'react'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'
import { Group } from '@databyss-org/services/interfaces'
import { useGroups, usePages } from '@databyss-org/data/pouchdb/hooks'
import { LoadingFallback } from '@databyss-org/ui/components'
import { pagesToListItemData } from '../transforms'

export const GroupList = (others) => {
  const groupsRes = useGroups()
  const pagesRes = usePages()

  const getGroupItems = (groups: Group[]) =>
    groups.map((group) => ({
      text: group.name,
      type: 'group',
      route: `/collections/${group._id}`,
      data: group,
      iconColor: group.public ? 'orange.2' : null,
      subItems: pagesToListItemData(
        group.pages.map((_id) => pagesRes.data![_id])
      ),
    }))

  if (!groupsRes.isSuccess || !pagesRes.isSuccess) {
    return <LoadingFallback queryObserver={[groupsRes, pagesRes]} />
  }
  const namedGroups = Object.values(groupsRes.data).filter(
    (group) => !!group.name && !group.localGroup
  )

  return (
    <SidebarList
      heading="Collections"
      menuItems={getGroupItems(namedGroups)}
      {...others}
    />
  )
}
