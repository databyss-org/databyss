import { prefix } from 'inline-style-prefixer'

import { macros, theme as defaultTheme } from '../../shared-styles'

const style = (theme = defaultTheme) => ({
  sourcesToc: {
    fontFamily: theme.bodyFont,
  },
  bottomHeaderContainer: {
    ...macros.mobile({
      display: 'flex',
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: '20px',
    }),
  },
  landing: {
    display: 'flex',
    flexDirection: 'column',
  },
  sticky: {
    paddingTop: '40px',
    position: 'sticky',
  },
})

export default prefix(style)
