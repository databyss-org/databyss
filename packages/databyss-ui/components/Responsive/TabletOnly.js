import { useMediaQuery } from 'react-responsive'
import { withTheme } from 'react-jss'

export default withTheme(({ theme, children }) => {
  const isTablet = useMediaQuery({ minWidth: theme.breakpoints.tablet })
  return isTablet ? children : null
})
