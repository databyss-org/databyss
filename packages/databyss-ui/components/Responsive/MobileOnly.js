import React from 'react'
import MediaQuery from 'react-responsive'
import { withTheme } from 'react-jss'
import { isMobileOs } from '../../lib/mediaQuery'
import { macros } from '../../shared-styles'

export default withTheme(
  ({ theme, children, orMobileOs = false }) =>
    orMobileOs && isMobileOs() ? (
      children
    ) : (
      <MediaQuery query={macros.mobileQuery(theme)}>{children}</MediaQuery>
    )
)
