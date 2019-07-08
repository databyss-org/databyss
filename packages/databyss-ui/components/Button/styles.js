import { theme as defaultTheme } from '../../shared-styles'

export default (theme = defaultTheme) => ({
  button: {
    border: 'none',
    background: 'none',
    padding: 0,
    userSelect: 'none',
    fontSize: 'unset',
  },

  closeButton: {
    composes: '$linkButton',
    color: theme.mediumGrey,

    marginTop: '0px',
    //  flexDirection: 'row-reverse',
  },

  linkButton: {
    color: theme.mediumGrey,
    fontFamily: theme.navFont,
    textDecoration: 'underline',

    '& path': {
      stroke: theme.lightGrey,
    },
  },

  backButton: {
    margin: '0px',
    composes: '$linkButton',
    flexDirection: 'row-reverse',

    '& svg': {
      marginRight: '0.5em',
    },
  },

  forwardButton: {
    composes: '$linkButton',

    '& svg': {
      transform: 'rotate(180deg)',
      marginLeft: '0.1em',
    },
  },

  transparentButton: {},
  touchDecay: {},
  disabled: {},
})
