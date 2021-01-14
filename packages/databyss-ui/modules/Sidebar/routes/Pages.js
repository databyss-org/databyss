import React from 'react'
import { PagesLoader } from '@databyss-org/ui/components/Loaders'
import { sortEntriesAtoZ } from '@databyss-org/services/entries/util'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'

export const getPagesData = (pages, archive) =>
  Object.values(pages)
    .filter((p) => (archive && p.archive) || !p.archive)
    .map((p) => ({
      text: p.name,
      type: 'page',
      route: `/pages/${p._id}`,
      data: p,
    }))

const Pages = ({ archive, ...others }) => (
  <PagesLoader archived={archive}>
    {(pages) => (
      <SidebarList
        data-test-element="sidebar-pages-list"
        menuItems={sortEntriesAtoZ(getPagesData(pages, archive), 'text')}
        {...others}
      />
    )}
  </PagesLoader>
)

export default Pages
