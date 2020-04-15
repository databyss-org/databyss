import React from 'react'
import { PagesLoader } from '@databyss-org/ui/components/Loaders'
import SidebarList from '../../../components/Sidebar/SidebarList'

const Pages = () => (
  <PagesLoader>
    {pages => {
      const _menuItems = Object.values(pages).map(p => ({
        text: p.name,
        type: 'pages',
        id: p._id,
      }))
      // alphabetize list
      _menuItems.sort((a, b) => (a.text > b.text ? 1 : -1))

      return <SidebarList menuItems={_menuItems} />
    }}
  </PagesLoader>
)

export default Pages
