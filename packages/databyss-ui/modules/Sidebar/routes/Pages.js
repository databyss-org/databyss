import React from 'react'
import { PagesLoader } from '@databyss-org/ui/components/Loaders'
import { sortEntriesAtoZ } from '@databyss-org/services/entries/util'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'

export const getPagesData = (pages) =>
  Object.values(pages)
    .filter((p) => !p.archive)
    .map((p) => ({
      text: p.name,
      type: 'page',
      route: '/pages',
      id: p._id,
      params: p._id,
    }))

const Pages = ({ archive, ...others }) => (
  <PagesLoader filtered archive={archive}>
    {(pages) => (
      <SidebarList
        data-test-element="sidebar-pages-list"
        menuItems={sortEntriesAtoZ(getPagesData(pages), 'text')}
        {...others}
      />
    )}
  </PagesLoader>
)

export default Pages
