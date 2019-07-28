import React from 'react'
import { ThemeProvider } from '@databyss-org/ui/theming'
import { View } from 'react-native'

const style = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
}

export const ThemeDecorator = storyFn => (
  <ThemeProvider>
    <View style={style}>{storyFn()}</View>
  </ThemeProvider>
)
