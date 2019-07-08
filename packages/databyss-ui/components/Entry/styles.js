import Color from 'color'
import { theme as defaultTheme } from '../../shared-styles'

export default (theme = defaultTheme) => ({
  entry: {
    fontFamily: theme.bodyFont,
    fontSize: theme.fontSizeNormal,
    marginTop: '0.2em',

    '& > div': {
      display: 'inline',
    },
  },
  content: {
    '& a, & a:active, & a:visited': {
      color: 'inherit',
      borderBottom: `1px dotted ${theme.pink}`,
      display: 'inline-block',
      lineHeight: '0.75em',
      textDecoration: 'none',
    },
  },
  location: {
    marginRight: '0.3em',
  },

  source: {
    cursor: 'pointer',
    marginRight: '0.3em',
    fontWeight: 'bold',
    color: theme.entrySourceColor,
    textDecoration: `underline solid ${Color(theme.entrySourceColor).lighten(
      0.7
    )}`,
  },

  backButton: {
    margin: '0px',
  },

  entryList: {
    marginTop: '0.2em',

    '& + $entryList': {
      marginTop: '1.6em',
    },
    '& > $entryList': {
      marginTop: '0.8em',
    },
  },
})
