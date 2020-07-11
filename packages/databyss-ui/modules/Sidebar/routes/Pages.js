import React from 'react'
import { PagesLoader } from '@databyss-org/ui/components/Loaders'
import {
  sortEntriesAtoZ,
  filterEntries,
} from '@databyss-org/services/sources/util'
import SidebarList from '../../../components/Sidebar/SidebarList'

const Pages = ({ filterQuery }) => (
  <>
    <PagesLoader>
      {pages => {
        const _menuItems = Object.values(pages).map(p => ({
          text: p.name,
          type: 'pages',
          route: '/pages',
          id: p._id,
        }))
        // alphabetize list
        const sortedPages = sortEntriesAtoZ(_menuItems, 'text')
        const filteredEntries = filterEntries(sortedPages, filterQuery)

        return (
          <SidebarList
            menuItems={
              filterQuery.textValue === '' ? sortedPages : filteredEntries
            }
          />
        )
      }}
    </PagesLoader>
  </>
)

export default Pages
