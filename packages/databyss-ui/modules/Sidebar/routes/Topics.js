import React from 'react'
import { AllTopicsLoader } from '@databyss-org/ui/components/Loaders'
import { useTopicContext } from '@databyss-org/services/topics/TopicProvider'
import {
  getSourcesData,
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

const Topics = ({ filterQuery }) => {
  const { state } = useTopicContext()
  const topicsData = getSourcesData(state.cache, 'topics')
  const sortedTopics = sortEntriesAtoZ(topicsData)
  const filteredEntries = filterEntries(sortedTopics, filterQuery)

  return (
    <AllTopicsLoader>
      {() => (
        <SidebarList
          menuItems={[
            ...topicsOverview,
            ...(filterQuery.textValue === '' ? sortedTopics : filteredEntries),
          ]}
        />
      )}
    </AllTopicsLoader>
  )
}

export default Topics
