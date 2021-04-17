import { useMediaQuery } from 'react-responsive'
import { withTheme } from 'react-jss'
import { isMobileOs } from '../../lib/mediaQuery'

export default withTheme(({ theme, children, orMobileOs = false }) => {
  const isTablet = useMediaQuery({ minWidth: theme.breakpoints.tablet })
  return orMobileOs && isMobileOs() ? children : !isTablet && children
})
