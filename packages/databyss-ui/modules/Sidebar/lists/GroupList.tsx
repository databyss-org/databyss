import React from 'react'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'
import { Group, Page } from '@databyss-org/services/interfaces'
import { useGroups, usePages } from '@databyss-org/data/pouchdb/hooks'
import RemoveSvg from '@databyss-org/ui/assets/trash.svg'
import {
  LoadingFallback,
  SidebarListItemData,
} from '@databyss-org/ui/components'
import { setGroup } from '@databyss-org/data/pouchdb/groups'
import { sortEntriesAtoZ } from '@databyss-org/services/entries/util'
import { pagesToListItemData } from '../transforms'
import { MenuItem } from '../../../components/Menu/DropdownList'
import { DraggableItem } from '../../..'

export const groupsToListItemData = (groups: Group[]) =>
  groups
    .filter((group) => !!group.name && !group.localGroup)
    .map((group) => {
      const _item: SidebarListItemData<Group, Page> = {
        text: group.name,
        type: 'group',
        route: `/collections/${group._id}`,
        data: group,
        iconColor: group.public ? 'orange.2' : null,
      }
      return _item
    })

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

  const onPageDrop = (group: Group) => (item: DraggableItem) => {
    const _page = item.payload as Page
    console.log('[GroupList] dropped page', _page)
    if (group.pages.includes(_page._id)) {
      return
    }
    // do not allow archived pages
    if (_page.archive) {
      return
    }
    const _group = {
      ...group,
      pages: group.pages.concat(_page._id),
    }
    setGroup(_group)
  }

  if (!groupsRes.isSuccess || !pagesRes.isSuccess) {
    return <LoadingFallback queryObserver={[groupsRes, pagesRes]} />
  }

  const items = groupsToListItemData(Object.values(groupsRes.data)).map(
    (item) => ({
      ...item,
      subItems: sortEntriesAtoZ(
        pagesToListItemData(item.data!.pages.map((_id) => pagesRes.data![_id])),
        'text'
      ).map((_subItem) => ({
        ..._subItem,
        contextMenu: pageMenuItems(item.data!),
      })),
      isDropzone: true,
      dropzoneProps: {
        accepts: 'PAGE',
        onDrop: onPageDrop(item.data!),
      },
    })
  )

  return <SidebarList heading="Collections" menuItems={items} {...others} />
}
