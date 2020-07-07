import React from 'react'
import { AllTopicsLoader } from '@databyss-org/ui/components/Loaders'
import {
  sortEntriesAtoZ,
  filterEntries,
} from '@databyss-org/services/sources/util'
import SidebarList from '../../../components/Sidebar/SidebarList'

const topicsOverview = [
  {
    type: 'topics',
    text: 'All Topics',
  },
]

const Topics = ({ filterQuery }) => (
  <AllTopicsLoader>
    {topics => {
      const topicsData = Object.values(topics).map(value => ({
        text: value.text.textValue,
        type: 'topics',
        id: value._id,
      }))
      const sortedTopics = sortEntriesAtoZ(topicsData)
      const filteredEntries = filterEntries(sortedTopics, filterQuery)

      return (
        <SidebarList
          menuItems={[
            ...topicsOverview,
            ...(filterQuery.textValue === '' ? sortedTopics : filteredEntries),
          ]}
        />
      )
    }}
  </AllTopicsLoader>
)

export default Topics
