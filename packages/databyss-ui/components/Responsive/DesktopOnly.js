import { useMediaQuery } from 'react-responsive'
import { withTheme } from 'react-jss'

export default withTheme(({ theme, children }) => {
  const isDesktop = useMediaQuery({ minWidth: theme.breakpoints.desktop })
  return isDesktop ? children : null
})
