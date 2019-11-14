import React from 'react'
import { ThemeProvider } from '@databyss-org/ui/theming'
import NotifyProvider from '@databyss-org/ui/components/Notify/NotifyProvider'
import { ScrollView, View } from 'react-native'
import env from '../env.json'

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

export const NotifyDecorator = storyFn => (
  <NotifyProvider
    options={{
      apiKey: env.BUGSNAG_KEY,
      releaseStage: env.BUGSNAG_RELEASE_STAGE,
    }}
  >
    {storyFn()}
  </NotifyProvider>
)
