import React from 'react'
import { ThemeProvider } from '@databyss-org/ui/theming'
import { ScrollView, View } from 'react-native'

export const ThemeDecorator = storyFn => (
  <ThemeProvider>{storyFn()}</ThemeProvider>
)

export const ContentDecorator = storyFn => (
  <View style={{ flex: 1 }}>
    <ScrollView
      contentContainerStyle={{
        padding: 24,
      }}
    >
      {storyFn()}
    </ScrollView>
  </View>
)
