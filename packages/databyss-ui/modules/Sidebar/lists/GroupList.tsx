import React from 'react'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'
import { Group, Page } from '@databyss-org/services/interfaces'
import { useGroups, usePages } from '@databyss-org/data/pouchdb/hooks'
import RemoveSvg from '@databyss-org/ui/assets/trash.svg'
import { LoadingFallback } from '@databyss-org/ui/components'
import { setGroup } from '@databyss-org/data/pouchdb/groups'
import { pagesToListItemData } from '../transforms'
import { MenuItem } from '../../../components/Menu/DropdownList'

export const GroupList = (others) => {
  const groupsRes = useGroups()
  const pagesRes = usePages()

  const pageMenuItems = (group: Group) => {
    const _menuItems: MenuItem[] = [
      {
        label: 'Remove from collection',
        icon: <RemoveSvg />,
        action: async (page: Page) => {
          const _group = {
            ...group,
            pages: group.pages.filter((_id) => _id !== page._id),
          }
          await setGroup(_group)
          return true
        },
      },
    ]
    return _menuItems
  }

  const getGroupItems = (groups: Group[]) =>
    groups.map((group) => ({
      text: group.name,
      type: 'group',
      route: `/collections/${group._id}`,
      data: group,
      iconColor: group.public ? 'orange.2' : null,
      subItems: pagesToListItemData(
        group.pages.map((_id) => pagesRes.data![_id])
      ).map((_subItem) => ({
        ..._subItem,
        contextMenu: pageMenuItems(group),
      })),
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
