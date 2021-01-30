import React from 'react'
import {
  sortEntriesAtoZ,
  createSidebarListItems,
} from '@databyss-org/services/entries/util'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'
import { usePages } from '@databyss-org/data/pouchdb/hooks'
import LoadingFallback from '@databyss-org/ui/components/Notify/LoadingFallback'

export const getPagesData = (pages) =>
  pages.map((p) =>
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

  const filtered = Object.values(pagesRes.data).filter((page) =>
    archive ? page.archive : !page.archive
  )
  const mapped = getPagesData(filtered)
  const sorted = sortEntriesAtoZ(mapped, 'text')

  return (
    <SidebarList
      data-test-element="sidebar-pages-list"
      menuItems={sorted}
      height={height}
    />
  )
}

export default Pages
