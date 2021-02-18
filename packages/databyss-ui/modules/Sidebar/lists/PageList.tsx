import React from 'react'
import { sortEntriesAtoZ } from '@databyss-org/services/entries/util'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'
import { usePages } from '@databyss-org/data/pouchdb/hooks'
import LoadingFallback from '@databyss-org/ui/components/Notify/LoadingFallback'
import { Page } from '@databyss-org/services/interfaces'
import {
  pagesToListItemData,
  SidebarTransformFunction,
} from '@databyss-org/ui/modules/Sidebar/transforms'

interface PageListProps {
  archive?: boolean
  transform?: SidebarTransformFunction<Page>
}

export const PageList = ({ archive, transform, ...others }: PageListProps) => {
  const pagesRes = usePages()

  if (!pagesRes.isSuccess) {
    return <LoadingFallback queryObserver={pagesRes} />
  }

  const filtered = Object.values(pagesRes.data).filter((page) =>
    archive ? page.archive : !page.archive
  )
  const mapped = transform!(filtered)
  const sorted = sortEntriesAtoZ(mapped, 'text')

  return (
    <SidebarList
      data-test-element="sidebar-pages-list"
      menuItems={sorted}
      {...others}
    />
  )
}

PageList.defaultProps = {
  transform: pagesToListItemData,
}
