import React from 'react'
import { ThemeProvider as JssThemeProvider } from 'react-jss'
import { ThemeProvider as EmotionThemeProvider } from 'emotion-theming'
import jss from 'jss'
import jssPreset from 'jss-preset-default'
import { theme as defaultTheme } from '.'
import globalStyles from './globalStyles'

jss.setup(jssPreset())

export default ({ theme = defaultTheme, children, ...others }) => {
  const globalClasses = jss.createStyleSheet(globalStyles(theme)).attach()
    .classes
  return (
    <JssThemeProvider theme={theme}>
      <EmotionThemeProvider theme={theme}>
        {React.cloneElement(React.Children.only(children), {
          ...others,
          className: `${globalClasses.root} ${children.props.className || ''}`,
        })}
      </EmotionThemeProvider>
    </JssThemeProvider>
  )
}
