import React from 'react'
import { PagesLoader } from '@databyss-org/ui/components/Loaders'
import {
  sortEntriesAtoZ,
  filterEntries,
  createSidebarListItems,
} from '@databyss-org/services/entries/util'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'

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

const Pages = ({ filterQuery, height }) => (
  <>
    <PagesLoader filtered>
      {(pages) => {
        const _menuItems = getPagesData(pages)
        const sortedPages = sortEntriesAtoZ(_menuItems, 'text')
        const filteredEntries = filterEntries(sortedPages, filterQuery)

        return (
          <SidebarList
            data-test-element="sidebar-pages-list"
            menuItems={
              filterQuery.textValue === '' ? sortedPages : filteredEntries
            }
            height={height}
          />
        )
      }}
    </PagesLoader>
  </>
)

export default Pages
