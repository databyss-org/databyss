import React from 'react'
import { AllTopicsLoader } from '@databyss-org/ui/components/Loaders'
import { sortEntriesAtoZ } from '@databyss-org/services/entries/util'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'

export const getTopicsData = (topics) =>
  Object.values(topics).map((value) => ({
    text: value.text.textValue,
    type: 'topic',
    route: '/topics',
    id: value._id,
    params: value._id,
  }))

const Topics = (others) => (
  <AllTopicsLoader filtered>
    {(topics) => (
      <SidebarList
        menuItems={sortEntriesAtoZ(getTopicsData(topics), 'text')}
        {...others}
      />
    )}
  </AllTopicsLoader>
)

export default Topics
