import React from 'react'
import {
  sortEntriesAtoZ,
  createSidebarListItems,
} from '@databyss-org/services/entries/util'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'
import { usePages } from '@databyss-org/data/pouchdb/hooks'
import LoadingFallback from '@databyss-org/ui/components/Notify/LoadingFallback'

export const getPagesData = (pages) =>
  Object.values(pages)
    .filter((p) => !p.archive)
    .map((p) =>
      createSidebarListItems({
        text: p.name,
        type: 'pages',
        route: '/pages',
        id: p._id,
        params: p._id,
      })
    )

const Pages = ({ archive, height }) => {
  const pagesRes = usePages()

  if (pagesRes.status !== 'success') {
    return <LoadingFallback />
  }

  const _menuItems = getPagesData(pagesRes.data)
  const sortedPages = sortEntriesAtoZ(_menuItems, 'text')
  const filteredEntries = sortedPages.filter((page) =>
    archive ? page.archive : !page.archive
  )

  return (
    <SidebarList
      data-test-element="sidebar-pages-list"
      menuItems={filteredEntries}
      height={height}
    />
  )
}

export default Pages
