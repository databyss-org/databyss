import React from 'react'
import { sortEntriesAtoZ } from '@databyss-org/services/entries/util'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'
import { usePages } from '@databyss-org/data/pouchdb/hooks'
import LoadingFallback from '@databyss-org/ui/components/Notify/LoadingFallback'
import { Page } from '@databyss-org/services/interfaces'
import { SidebarListItem } from '@databyss-org/ui/components'

export const pagesToListItems = (pages: Page[]): SidebarListItem<Page>[] =>
  pages.map((p) => ({
    text: p.name,
    type: 'page',
    route: `/pages/${p._id}`,
    data: p,
  }))

interface PageListProps {
  archive?: boolean
}

export const PageList = ({ archive, ...others }: PageListProps) => {
  const pagesRes = usePages()

  if (!pagesRes.isSuccess) {
    return <LoadingFallback queryObserver={pagesRes} />
  }

  const filtered = Object.values(pagesRes.data).filter((page) =>
    archive ? page.archive : !page.archive
  )
  const mapped = pagesToListItems(filtered)
  const sorted = sortEntriesAtoZ(mapped, 'text')

  return (
    <SidebarList
      data-test-element="sidebar-pages-list"
      menuItems={sorted}
      {...others}
    />
  )
}
