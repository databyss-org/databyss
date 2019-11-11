import { macros, theme as defaultTheme } from '../../theming'

export default (theme = defaultTheme) => ({
  viewport: {
    padding: '20px',
    backgroundColor: theme.white,
    position: 'relative',
    fontFamily: theme.fonts.bodyFont,
    // fontSize: theme.fontSizes.normal,
    textRendering: 'optimizeLegibility',
    '-webkit-font-smoothing': 'antialiased',

    '&.fullscreen': {
      minHeight: '100vh',
      boxSizing: 'border-box',
    },

    ...macros.mobile(
      {
        padding: '15px',
      },
      theme
    ),
  },

  content: {
    maxWidth: theme.widthVariants.content.maxWidth,
    // lineHeight: theme.lineHeights.normal,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },

  landingBody: {
    flex: 1,
    paddingBottom: '20px',
    maxWidth: '1024px',
    marginLeft: 'auto',
    marginRight: 'auto',
    left: 0,
    right: 0,
    width: '100%',
  },
})
