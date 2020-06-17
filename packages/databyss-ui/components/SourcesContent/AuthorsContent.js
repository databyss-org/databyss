import React, { useEffect } from 'react'
import { Router } from '@reach/router'
import { EntrySearchLoader } from '@databyss-org/ui/components/Loaders'
import {
  Text,
  View,
  BaseControl,
  ScrollView,
} from '@databyss-org/ui/primitives'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'

export const AuthorsRouter = () => (
  <Router>
    <AuthorsContent path="/" />
  </Router>
)

const AuthorsContent = () => {
  const { getAllSources, state } = useSourceContext()
  useEffect(() => getAllSources(), [])

  const sourcesData = () =>
    Object.entries(state.cache).map(([, value]) => {
      const author = value.authors[0]

      return {
        id: value._id,
        text: value.text.textValue,
        author: author
          ? `${author.lastName.textValue}, ${author.firstName.textValue}`
          : 'Unknown author',
      }
    })

  const ComposeResults = () => {
    const sortedSources = sourcesData().sort(
      (a, b) => (a.author > b.author ? 1 : -1)
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
          <Text variant="bodyNormalSemibold">{entry.author}</Text>
        </BaseControl>
      </View>
    ))
  }

  return (
    <ScrollView p="medium" flex="1" maxHeight="98vh">
      <View p="medium">
        <Text variant="bodyLarge" color="text.3">
          All Authors
        </Text>
      </View>
      <EntrySearchLoader>{ComposeResults}</EntrySearchLoader>
    </ScrollView>
  )
}

export default AuthorsContent
