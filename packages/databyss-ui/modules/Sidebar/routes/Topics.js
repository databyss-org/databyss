import React, { useEffect } from 'react'
import { AllTopicsLoader } from '@databyss-org/ui/components/Loaders'
import {
  sortEntriesAtoZ,
  filterEntries,
  createSidebarListItems,
} from '@databyss-org/services/entries/util'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'
import TopicSvg from '@databyss-org/ui/assets/topic.svg'

const topicsOverview = [
  {
    type: 'topics',
    text: 'All Topics',
    route: '/topics',
  },
]

export const getTopicsData = topics =>
  Object.values(topics).map(value =>
    createSidebarListItems({
      text: value.text.textValue,
      type: 'topics',
      route: '/topics',
      id: value._id,
      params: value._id,
      icon: <TopicSvg />,
    })
  )

const Topics = ({ filterQuery, height, hasIndexPage }) => (
  <AllTopicsLoader filtered>
    {topics => {
      const topicsData = getTopicsData(topics)
      const sortedTopics = sortEntriesAtoZ(topicsData, 'text')
      const filteredEntries = filterEntries(sortedTopics, filterQuery)

      return (
        <SidebarList
          menuItems={[
            ...(hasIndexPage ? topicsOverview : ''),
            ...(filterQuery.textValue === '' ? sortedTopics : filteredEntries),
          ]}
          height={height}
        />
      )
    }}
  </AllTopicsLoader>
)

export default Topics
