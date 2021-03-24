import React from 'react'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'
import { Group } from '@databyss-org/services/interfaces'
import { useGroups, usePages } from '@databyss-org/data/pouchdb/hooks'
import { LoadingFallback } from '@databyss-org/ui/components'
import { sortEntriesAtoZ } from '@databyss-org/services/entries/util'

export const GroupList = (others) => {
  const groupsRes = useGroups()
  const pagesRes = usePages()

  const getGroupItems = (groups: Group[]) =>
    groups.map((group) => ({
      text: group.name,
      type: 'group',
      route: `/collections/${group._id}`,
      data: group,
    }))

  // const sorted = sortEntriesAtoZ(mapped, 'text')

  // console.log('SORTED', sorted)

  const getPageItems = (groups: Group[]) =>
    sortEntriesAtoZ(
      groups.map((group) => ({
        text: pagesRes.data![group.pages[0]]?.name,
        type: 'page',
        route: `/pages/${group._id.substring(2)}`,
        data: group,
      })),
      'text'
    )

  if (!groupsRes.isSuccess || !pagesRes.isSuccess) {
    return <LoadingFallback queryObserver={groupsRes} />
  }
  const namedGroups = Object.values(groupsRes.data).filter(
    (group) => !!group.name
  )
  const publicPages = Object.values(groupsRes.data).filter(
    (group) => !group.name
  )

  return (
    <SidebarList
      menuItems={[
        {
          text: 'My Collections',
          type: 'heading',
        },
        ...getGroupItems(namedGroups),
        {
          text: 'Public Pages',
          type: 'heading',
        },
        ...getPageItems(publicPages),
      ]}
      {...others}
    />
  )
}
