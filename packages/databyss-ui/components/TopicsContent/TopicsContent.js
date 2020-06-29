import React from 'react'
import { Router } from '@reach/router'
import { AllTopicsLoader } from '@databyss-org/ui/components/Loaders'
import {
  Text,
  View,
  BaseControl,
  ScrollView,
} from '@databyss-org/ui/primitives'
import { useTopicContext } from '@databyss-org/services/topics/TopicProvider'
import IndexPageEntries from '../PageContent/IndexPageEntries'
import IndexPageContent from '../PageContent/IndexPageContent'

export const TopicsRouter = () => (
  <Router>
    <TopicsContent path="/" />
  </Router>
)

const TopicsContent = () => {
  const { state } = useTopicContext()

  const topicsData = () =>
    Object.entries(state.cache).map(([, value]) => ({
      id: value._id,
      text: value.text.textValue,
    }))

  const sortedSources = topicsData().sort((a, b) => (a.text > b.text ? 1 : -1))

  return (
    <IndexPageContent title="All Topics">
      <IndexPageEntries entries={sortedSources} />
    </IndexPageContent>
  )
}

export default TopicsContent
