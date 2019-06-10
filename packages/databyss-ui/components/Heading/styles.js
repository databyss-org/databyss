import { theme as defaultTheme } from '../../shared-styles'

export default (theme = defaultTheme) => ({
  pageHeading: {
    fontFamily: theme.headingFont,
    fontWeight: theme.fontBold,
    color: theme.darkGrey,
    fontSize: theme.fontSizeL,
    lineHeight: theme.lineHeightContent,
  },

  landingHeader: {
    top: -40,
    backgroundColor: 'white',
    width: '100%',
    alignItems: 'stretch',
    fontSize: '1em',
    zIndex: 10,
    transition: 'padding 300ms ease-in-out',
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
    padding: '10px 16px 10px 0',
    margin: '30px 0 18px 0',
    backgroundColor: theme.lightGrey,

    '&:before': {
      content: '""',
      backgroundColor: theme.lightGrey,
    },
  },
  text: {
    paddingLeft: '14px',
  },

  headingContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
  },
  title: {
    width: '100%  ',
  },
  titleWithToggle: {
    width: 'calc(100% - 130px)',
  },
  toggle: {
    width: '130px',
    margin: '-0.6em 0',
  },
})
