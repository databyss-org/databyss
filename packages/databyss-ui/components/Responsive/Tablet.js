import React from 'react'
import MediaQuery from 'react-responsive'
import { withTheme } from 'react-jss'
import { macros } from '../../shared-styles'
import { isMobileOs } from '../../lib/mediaQuery'

export default withTheme(
  ({ theme, children, mobileOs = false, notMobileOs = false }) => {
    let device = true
    if (mobileOs) {
      device = isMobileOs()
    }
    if (notMobileOs) {
      device = !isMobileOs()
    }
    return device ? (
      <MediaQuery query={macros.tabletQuery(theme)}>{children}</MediaQuery>
    ) : null
  }
)
