import { theme as defaultTheme } from '../../shared-styles'

export default (theme = defaultTheme) => ({
  /*
  motifLinksSwitch: {
    position: 'absolute',
    right: 1,
  },
  */
  sourcesToc: {
    fontFamily: theme.bodyFont,
  },
  landing: {
    position: 'fixed',
    height: 'calc(100% - 100px)',
    display: 'flex',
    flexDirection: 'column',
  },
})
