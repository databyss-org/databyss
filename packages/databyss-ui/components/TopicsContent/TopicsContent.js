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

  const ComposeResults = () => {
    const sortedSources = topicsData().sort(
      (a, b) => (a.text > b.text ? 1 : -1)
    )

    return sortedSources.map((entry, index) => (
      <View key={index} mb="em">
        <BaseControl
          py="small"
          px="small"
          mx="em"
          hoverColor="background.2"
          activeColor="background.3"
        >
          <Text variant="bodyNormalSemibold">{entry.text}</Text>
        </BaseControl>
      </View>
    ))
  }

  return (
    <ScrollView p="medium" flex="1" maxHeight="98vh">
      <View p="medium">
        <Text variant="bodyLarge" color="text.3">
          All Topics
        </Text>
      </View>
      <AllTopicsLoader>{ComposeResults}</AllTopicsLoader>
    </ScrollView>
  )
}

export default TopicsContent
