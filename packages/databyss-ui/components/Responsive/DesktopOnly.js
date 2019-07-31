import React from 'react'
import MediaQuery from 'react-responsive'
import { withTheme } from 'react-jss'
import { macros } from './../../theming'

export default withTheme(({ theme, children }) => (
  <MediaQuery query={macros.desktopQuery(theme)}>{children}</MediaQuery>
))
