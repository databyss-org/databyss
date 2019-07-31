import { theme as defaultTheme } from '../../shared-styles'

export default (theme = defaultTheme) => ({
  link: {
    color: theme.darkGrey,
    display: 'block',
    lineHeight: '2em',

    '&$inline': {
      display: 'inline',
      lineHeight: '1.3em',
    },
  },
  contentNav: {
    fontFamily: theme.navFont,

    '& $nav': {
      marginBottom: '1em',
    },

    '& $list': {
      display: 'flex',
      alignItems: 'center',
      flexGrow: 1,
    },

    '& $left, & $right': {
      display: 'flex',
      flex: 1,
    },

    '& $right': {
      justifyContent: 'flex-end',
    },
  },
  inline: {},
  nav: {},
  list: {},
  left: {},
  right: {},
})
