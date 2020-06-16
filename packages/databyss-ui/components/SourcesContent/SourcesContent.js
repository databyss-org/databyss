import React, { useEffect } from 'react'
import { useParams, Router } from '@reach/router'
import { EntrySearchLoader } from '@databyss-org/ui/components/Loaders'
import {
  Text,
  View,
  BaseControl,
  ScrollView,
} from '@databyss-org/ui/primitives'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'

export const SourcesRouter = () => (
  <Router>
    <SourcesContent path="/" />
  </Router>
)

const SourcesContent = () => {
  // const { query } = useParams()
  const { getAllSources, state } = useSourceContext()
  useEffect(() => getAllSources(), [])

  const sourcesData = () =>
    Object.entries(state.cache).map(([, value]) => {
      const author = value.authors[0]

      return {
        id: value._id,
        text: value.text.textValue,
        author: {
          firstName: author ? author.firstName.textValue : '',
          lastName: author ? author.lastName.textValue : '',
        },
      }
    })

  const ComposeResults = () => {
    const sortedSources = sourcesData().sort(
      (a, b) => (a.text > b.text ? 1 : -1)
    )

    return sortedSources.map((entry, index) => (
      <View key={index} mb="medium">
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
          All Sources
        </Text>
      </View>
      <EntrySearchLoader>{ComposeResults}</EntrySearchLoader>
    </ScrollView>
  )
}

export default SourcesContent
