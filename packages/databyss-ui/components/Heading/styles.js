import { macros, theme as defaultTheme } from '../../shared-styles'

export default (theme = defaultTheme) => ({
  pageHeading: {
    fontFamily: theme.headingFont,
    fontWeight: theme.fontBold,
    color: theme.darkGrey,
    fontSize: theme.fontSizeL,
    lineHeight: theme.lineHeightContent,
  },

  pageHeadingSticky: {
    fontFamily: theme.headingFont,
    fontWeight: theme.fontBold,
    color: theme.darkGrey,
    fontSize: theme.fontSizeNormal,
    lineHeight: theme.lineHeightContent,
  },

  landingHeader: {
    top: -40,
    backgroundColor: 'white',
    width: '100%',
    alignItems: 'stretch',
    fontSize: '1em',
    zIndex: 10,
    transition: '300ms ease-in-out',
  },

  pageSubHeading: {
    fontFamily: theme.bodyFont,
    fontWeight: theme.fontSemibold,
    color: theme.darkGrey,
    fontSize: theme.fontSizeNormal,
    lineHeight: theme.lineHeightContent,
  },

  headerPageSubHeading: {
    fontFamily: theme.bodyFont,
    fontWeight: theme.fontSemibold,
    color: theme.darkGrey,
    fontSize: theme.fontSizeNormal,
    lineHeight: theme.lineHeightContent,
  },

  headerPageSubHeadingSticky: {
    paddingTop: '0.2em',

    fontFamily: theme.bodyFont,
    fontWeight: theme.fontSemibold,
    color: theme.darkGrey,
    fontSize: theme.fontSizeS,
    lineHeight: theme.lineHeightContent,
  },

  contentHeading: {
    composes: '$pageSubHeading',
    padding: '10px 16px 10px 0',
    margin: '30px 0 24px 0',
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
    paddingBottom: '20px',

    ...macros.mobile({
      flexWrap: 'wrap',
    }),
  },

  title: {
    width: '100%  ',
  },
  titleWithToggle: {
    width: 'calc(100% - 160px)',
    ...macros.mobile({
      width: '100%',
    }),
  },
  toggle: {
    width: '150px',
    margin: '-0.6em 0',
    ...macros.mobile({
      display: 'flex',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      width: '100%',
      margin: '-0.6em 0',
    }),
  },
})
