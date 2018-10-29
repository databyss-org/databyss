import React from 'react'
import ThemeProvider from './ThemeProvider'
import { theme as defaultTheme } from '../../shared-styles'
import Viewport from './Viewport'

export default ({ theme = defaultTheme, children, ...others }) => (
  <ThemeProvider theme={theme}>
    <Viewport {...others}>{children}</Viewport>
  </ThemeProvider>
)
