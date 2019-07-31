import React from 'react'
import MediaQuery from 'react-responsive'
import { withTheme } from 'react-jss'
import { macros } from '../../shared-styles'

export default withTheme(({ theme, children }) => (
  <MediaQuery query={macros.tabletOnlyQuery(theme)}>{children}</MediaQuery>
))
