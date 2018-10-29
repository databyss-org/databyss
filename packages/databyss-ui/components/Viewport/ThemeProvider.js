import React from 'react'
import { ThemeProvider } from 'react-jss'
import jss from 'jss'
import jssPreset from 'jss-preset-default'
import { theme as defaultTheme } from '../../shared-styles'
import globalStyles from './globalStyles'

jss.setup(jssPreset())

export default ({ theme = defaultTheme, children, ...others }) => {
  const globalClasses = jss.createStyleSheet(globalStyles(theme)).attach()
    .classes
  return (
    <ThemeProvider theme={theme}>
      {React.cloneElement(React.Children.only(children), {
        ...others,
        className: `${globalClasses.root} ${children.props.className || ''}`,
      })}
    </ThemeProvider>
  )
}
