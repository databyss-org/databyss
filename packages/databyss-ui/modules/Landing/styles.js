import { theme as defaultTheme } from '../../shared-styles'

export default (theme = defaultTheme) => ({
  sourcesToc: {
    fontFamily: theme.bodyFont,
  },
  landing: {
    display: 'flex',
    flexDirection: 'column',
  },
})
