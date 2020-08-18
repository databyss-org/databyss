import React from 'react'
import { PagesLoader } from '@databyss-org/ui/components/Loaders'
import {
  sortEntriesAtoZ,
  filterEntries,
  createSidebarListItems,
} from '@databyss-org/services/entries/util'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'

const Pages = ({ filterQuery, height }) => (
  <>
    <PagesLoader>
      {pages => {
        const _menuItems = Object.values(pages).map(p =>
          createSidebarListItems({
            text: p.name,
            type: 'pages',
            route: '/pages',
            id: p._id,
            params: p._id,
          })
        )
        // alphabetize list
        const sortedPages = sortEntriesAtoZ(_menuItems, 'text')
        const filteredEntries = filterEntries(sortedPages, filterQuery)

        return (
          <SidebarList
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
