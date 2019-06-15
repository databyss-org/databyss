import { macros, theme as defaultTheme } from '../../shared-styles'

export default (theme = defaultTheme) => ({
  '@keyframes decay': {
    '0%': {
      opacity: '0.4',
    },
    '100%': {
      opacity: 0,
    },
  },

  dropdown: {
    paddingBottom: '6px',
    paddingTop: '5px',
    display: 'inline-block',
    width: '125px',
    outline: 'none',
    fontFamily: theme.navFont,
    fontSize: '0.9em',

    '&:hover': {
      outline: 'none',
    },
  },

  dropdownTitle: {
    margin: '0px',
    display: 'inline-block',
    marginRight: '6px',
    fontSize: '0.9em',
    fontFamily: theme.navFont,
    color: '#807d79',
  },

  control: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    position: 'relative',
    margin: '0.6em 0',
    justifyContent: 'flex-end',

    /* control highlight */
    '&:after': {
      content: '""',
      position: 'absolute',
      top: '-4px',
      bottom: '-4px',
      left: '-4px',
      right: '-4px',
      backgroundColor: theme.black,
      opacity: 0,
      borderRadius: '3px',
    },

    '&$disabled': {
      filter: 'grayscale(100%)',

      '&:before': {
        content: '""',
        backgroundColor: theme.white,
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        position: 'absolute',
        opacity: 0.4,
        zIndex: 10,
      },
    },

    '&$focused': {
      ...macros.focused(theme),
    },

    '&:focus:after, &$focused:after': {
      opacity: 0.1,
    },

    '&$touchDecay:not([disabled]):after': {
      animation: `decay ${theme.slow} ease-out`,
    },

    ...macros.notMobileOs({
      '&:hover:not([disabled]):not(:active)': {
        filter: 'none',

        '&:after': {
          opacity: 0.1,
        },
      },
      '&:active:not([disabled]):after': {
        opacity: 0.3,
      },
    }),
  },

  label: {
    fontFamily: theme.navFont,
    fontSize: theme.fontSizeS,
    color: theme.mediumGrey,
    marginRight: '0.5em',
  },

  toggleControl: {
    '& input': {
      opacity: 0,
      position: 'absolute',
    },
  },

  switchControl: {
    paddingRight: '3px',
    '& $switchHandle': {
      boxSizing: 'border-box',
      width: '35px',
      height: '20px',
      backgroundColor: theme.lighterGrey,
      border: `1px solid ${theme.hairlineGrey}`,
      borderRadius: '4px',
      position: 'relative',
      marginBottom: '3px',
      transition: `all ${theme.superQuick} linear`,
      flexShrink: 0,

      '&:before': {
        content: '""',
        boxSizing: 'border-box',
        background: '#ffffff',
        border: `1px solid ${theme.lighterGrey}`,
        boxShadow: theme.lightShadow,
        borderRadius: theme.borderRadius,
        position: 'absolute',
        transition: `all ${theme.superQuick} ${theme.ease}`,
        left: 0,
        top: 0,
        width: '18px',
        height: '18px',
      },
    },

    '& input:checked + $switchHandle': {
      backgroundColor: theme.mediumGrey,
      borderColor: theme.mediumGrey,

      '&:before': {
        left: '15px',
        borderColor: theme.white,
      },
    },
  },

  touchDecay: {},
  disabled: {},
  switchHandle: {},
  focused: {},
})
