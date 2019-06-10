import { theme as defaultTheme } from '../../shared-styles'

export default (theme = defaultTheme) => ({
  sourcesToc: {
    fontFamily: theme.bodyFont,
  },
  landing: {
    overflow: 'auto',
    maxHeight: '100vh',
    /*
    position: 'fixed',
    height: 'calc(100% - 100px)',
    */
    display: 'flex',
    flexDirection: 'column',
  },
})
