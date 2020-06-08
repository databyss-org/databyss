import React from 'react'
import SidebarList from '../../../components/Sidebar/SidebarList'

const menuItems = [
  {
    type: 'topics',
    text: 'All Topics',
  },
]

const Topics = () => <SidebarList menuItems={menuItems} />

export default Topics
