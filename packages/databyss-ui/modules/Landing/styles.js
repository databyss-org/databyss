import { macros, theme as defaultTheme } from '../../shared-styles'

export default (theme = defaultTheme) => ({
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
})
