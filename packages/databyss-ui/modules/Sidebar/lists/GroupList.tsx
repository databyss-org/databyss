import React from 'react'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'
import { Group } from '@databyss-org/services/interfaces'
import { useGroups } from '@databyss-org/data/pouchdb/hooks'
import { LoadingFallback } from '@databyss-org/ui/components'

export const GroupList = (others) => {
  const groupsRes = useGroups()

  const getGroupItems = (groups: Group[]) =>
    groups.map((group) => ({
      text: group.name,
      type: 'group',
      route: `/collections/${group._id}`,
      data: group,
      iconColor: group.public ? 'orange.2' : null,
    }))

  if (!groupsRes.isSuccess) {
    return <LoadingFallback queryObserver={groupsRes} />
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
