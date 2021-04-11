import React from 'react'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'
import { Group } from '@databyss-org/services/interfaces'
import { useGroups } from '@databyss-org/data/pouchdb/hooks'
import { LoadingFallback } from '@databyss-org/ui/components'
import { sortEntriesAtoZ } from '@databyss-org/services/entries/util'

export const GroupList = (others) => {
  const groupsRes = useGroups()

  const getGroupItems = (groups: Group[]) =>
    sortEntriesAtoZ(
      groups.map((group) => ({
        text: group.name,
        type: 'group',
        route: `/collections/${group._id}`,
        data: group,
        iconColor: group.public ? 'yellow' : null,
      })),
      'text'
    )

  // const sorted = sortEntriesAtoZ(mapped, 'text')

  if (!groupsRes.isSuccess) {
    return <LoadingFallback queryObserver={groupsRes} />
  }
  const namedGroups = Object.values(groupsRes.data).filter(
    (group) => !!group.name
  )

  return (
    <SidebarList
      menuItems={[
        {
          text: 'My Collections',
          type: 'heading',
        },
        ...getGroupItems(namedGroups),
      ]}
      {...others}
    />
  )
}
