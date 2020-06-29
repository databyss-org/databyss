import React from 'react'
import { AllTopicsLoader } from '@databyss-org/ui/components/Loaders'
import { useTopicContext } from '@databyss-org/services/topics/TopicProvider'
import SidebarList from '../../../components/Sidebar/SidebarList'

const topicsOverview = [
  {
    type: 'topics',
    text: 'All Topics',
  },
]

const Topics = () => {
  const { state } = useTopicContext()

  const topicsData = () =>
    Object.entries(state.cache).map(([, value]) => ({
      id: value._id,
      type: 'topics',
      text: value.text.textValue,
    }))

  const sortedSources = topicsData().sort((a, b) => (a.text > b.text ? 1 : -1))

  return (
    <AllTopicsLoader>
      {() => <SidebarList menuItems={[...topicsOverview, ...sortedSources]} />}
    </AllTopicsLoader>
  )
}

export default Topics
