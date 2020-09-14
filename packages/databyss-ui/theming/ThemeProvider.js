import React from 'react'
import { ThemeProvider as JssThemeProvider } from 'react-jss'
import { ThemeProvider as EmotionThemeProvider } from 'emotion-theming'
import jss from 'jss'
import jssPreset from 'jss-preset-default'
import { theme as defaultTheme } from '.'
import { View } from '../primitives'
import makeGlobalStyles from './globalStyles'

jss.setup(jssPreset())

export default ({
  theme = defaultTheme,
  children,
  globalStyles,
  ...others
}) => {
  const globalClasses = jss
    .createStyleSheet(makeGlobalStyles(theme, globalStyles))
    .attach().classes
  return (
    <View className={globalClasses.root}>
      <JssThemeProvider theme={theme}>
        <EmotionThemeProvider theme={theme} {...others}>
          {children}
        </EmotionThemeProvider>
      </JssThemeProvider>
    </View>
  )
}
