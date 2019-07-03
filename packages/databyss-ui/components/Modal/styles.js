import { macros, theme as defaultTheme } from '../../shared-styles'

const fullscreen = theme => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  maxHeight: 'unset',
  maxWidth: 'unset',
  height: '100%',
  border: 0,

  ...macros.mobileOrMobileOs(
    {
      height: window.innerHeight,
    },
    theme
  ),

  '& $header': {
    position: 'fixed',
    top: 0,
    left: 0,
    right: '15px',
    backgroundColor: theme.white,
    zIndex: theme.zIndex.fixedHeader,
    justifyContent: 'space-between',
  },
  '& $title': {
    flexGrow: 0,
  },
  '& $content': {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    padding: '165px 25px 25px',
  },
  '& $footer': {
    display: 'none',
  },
})

const style = (theme = defaultTheme) => ({
  close: {
    position: 'absolute',
    top: '30px',
    right: '20px',
  },
  modalContainer: {
    display: 'none',
    ...macros.mobile({
      display: 'block',
    }),
  },
  modalHeader: {
    paddingTop: '6px',
    width: 'calc(100% - 40px)',
    color: theme.bgColorDark,
    // fontSize: theme.fontSizeL,
    fontWeight: theme.fontBold,
    lineHeight: theme.lineHeightContent,
  },
  modalTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100vw',
    // borderBottom: '1px solid #d6d6d6',
    padding: '20px',
    paddingTop: '30px',
  },
  authorName: {
    fontSize: theme.fontSizeNormal,
    fontFamily: theme.navFont,
    lineHeight: 2.8,
    cursor: 'pointer',
    color: theme.bgColorDark,
    textDecoration: 'none',
    height: '100%',
    width: '100%',
    display: 'inline-block',
  },
  borderBottom: {
    borderBottom: `1px solid ${theme.hairlineGrey}`,
  },
  info: {
    // width: '100vw',
    paddingLeft: '20px',
    paddingBottom: '12px',
    paddingTop: '12px',
    fontFamily: 'DINNextLTPro-MediumCond',
    fontSize: '1.2em',
    lineHeight: '2em',
    // borderBottom: '1px solid #d6d6d6',
  },

  // new part --------------
  editable: {},
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    maxWidth: theme.mobileWidth,
    width: '100%',
    background: theme.white,
    outline: 'none',
    border: `1px solid ${theme.hairlineGrey}`,
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.5)',
    borderRadius: '3px',
    zIndex: theme.zIndex.modal,
    flexShrink: '1',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '60%',
    maxHeight: '90%',

    '&$fitContent': {
      minHeight: 'unset',
    },

    '&$wide': {
      maxWidth: theme.wideModalWidth,
    },

    '&$contentHandlesScroll': {
      height: '100vh',

      '& $header': {
        position: 'relative',
      },

      '& $content': {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
        height: '100%',
      },
    },

    '&$fullscreen': {
      ...fullscreen(theme),
      '& $closeButton svg': {
        width: '40px',
        height: '40px',
      },
    },

    ...macros.tabletNotMobileOs(
      {
        '&$fullscreen $header': {
          borderBottom: 0,
        },
      },
      theme
    ),

    ...macros.mobileOrMobileOs(
      {
        '&$editable, &$editable$fullscreen': {
          ...fullscreen(theme),
          '& $content': {
            ...fullscreen(theme)['& $content'],
            padding: '75px 10px 0',
          },
          '& $header': {
            ...fullscreen(theme)['& $header'],
            backgroundColor: theme.purple,
            right: 0,
          },
          '& $backButton': {
            display: 'block',
            color: theme.white,
          },
          '& $title': {
            position: 'absolute',
            width: '50%',
            left: 0,
            right: 0,
            margin: '0 auto',
            textAlign: 'center',
            height: '2em',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            color: theme.white,
          },
          '& $headerPrimaryButton': {
            display: 'block',
            padding: '10px 5px',
            color: theme.white,
          },
        },
      },
      theme
    ),
    ...macros.mobile(
      {
        maxWidth: '90%',
        '&$fullscreen$editable $header': {
          right: 0,
        },
      },
      theme
    ),
  },
  header: {
    zIndex: 1,
    width: '100vw',
    fontFamily: theme.primaryFont,
    fontSize: theme.fontSizeL,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    flexShrink: '0',
  },
  backButton: {
    padding: '10px 5px',
  },
  title: {
    flexGrow: 1,
    width: '100vw',
    borderBottom: `1px solid ${theme.hairlineGrey}`,
  },
  headerPrimaryButton: {},
  content: {
    padding: '18px 10px',
    overflowY: 'scroll',
    flexShrink: 1,
    flexGrow: 1,
    position: 'relative',
    '-webkit-overflow-scrolling': 'touch',
  },
  footer: {
    borderTop: `1px solid ${theme.hairlineGrey}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '12px 10px',
    flexShrink: 0,

    '& button': {
      marginLeft: '12px',
      '&$okButtonWide': {
        marginLeft: 0,
        flexGrow: 1,
      },
    },
  },
  closeButton: {
    position: 'fixed',
    top: '30px',
    right: '20px',
  },
  fullscreen: {},
  wide: {},
  fitContent: {},
  contentHandlesScroll: {},
  okButtonWide: {},
})

export default style
