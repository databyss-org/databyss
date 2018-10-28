import { theme as defaultTheme } from '../../shared-styles'

export default (theme = defaultTheme) => ({
  pageHeading: {
    fontFamily: theme.headingFont,
    fontWeight: theme.fontBold,
    color: theme.darkGrey,
    fontSize: theme.fontSizeL,
    lineHeight: theme.lineHeightContent,
  },

  pageSubHeading: {
    fontFamily: theme.bodyFont,
    fontWeight: theme.fontSemibold,
    color: theme.darkGrey,
    fontSize: theme.fontSizeNormal,
    lineHeight: theme.lineHeightContent,
  },

  contentHeading: {
    composes: '$pageSubHeading',
    position: 'relative',
    padding: '10px 16px 10px 0',
    margin: '30px 0 18px',

    '&:before': {
      content: '""',
      backgroundColor: theme.lightGrey,
      zIndex: 0,
      position: 'absolute',
      left: '-8px',
      right: '-8px',
      top: 0,
      bottom: 0,
    },
  },
  text: {
    position: 'relative',
    zIndex: 10,
  },
})
