import React from 'react'
import { AllTopicsLoader } from '@databyss-org/ui/components/Loaders'
import {
  sortEntriesAtoZ,
  filterEntries,
  createSidebarListItems,
} from '@databyss-org/services/entries/util'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'

export const getTopicsData = (topics) =>
  Object.values(topics).map((value) =>
    createSidebarListItems({
      text: value.text.textValue,
      type: 'topic',
      route: '/topics',
      id: value._id,
      params: value._id,
    })
  )

const Topics = ({ filterQuery, height }) => (
  <AllTopicsLoader filtered>
    {(topics) => {
      const topicsData = getTopicsData(topics)
      const sortedTopics = sortEntriesAtoZ(topicsData, 'text')
      const filteredEntries = filterEntries(sortedTopics, filterQuery)

      return (
        <SidebarList
          menuItems={
            filterQuery.textValue === '' ? sortedTopics : filteredEntries
          }
          height={height}
        />
      )
    }}
  </AllTopicsLoader>
)

export default Topics
