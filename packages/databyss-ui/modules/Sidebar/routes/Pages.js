import React from 'react'
import { PagesLoader } from '@databyss-org/ui/components/Loaders'
import SidebarList from '../../../components/Sidebar/SidebarList'

const Pages = ({ filterQuery }) => (
  <>
    <PagesLoader>
      {pages => {
        const _menuItems = Object.values(pages).map(p => ({
          text: p.name,
          type: 'pages',
          id: p._id,
        }))
        // alphabetize list
        _menuItems.sort(
          (a, b) => (a.text.toLowerCase() > b.text.toLowerCase() ? 1 : -1)
        )

        const filteredEntries = _menuItems.filter(entry =>
          entry.text?.toLowerCase().includes(filterQuery.textValue)
        )

        return (
          <SidebarList
            menuItems={
              filterQuery.textValue === '' ? _menuItems : filteredEntries
            }
          />
        )
      }}
    </PagesLoader>
  </>
)

export default Pages
