import { macros, theme as defaultTheme } from '../../shared-styles'

const style = (theme = defaultTheme) => ({
  authorsModal: {
    paddingLeft: '20px',
    paddingRight: '20px',
  },
  borderBottom: {
    borderBottom: `1px solid ${theme.bgColorLight}`,
  },
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
    fontSize: theme.fontSizeL,
    fontWeight: theme.fontBold,
    lineHeight: theme.lineHeightContent,
  },
  modalTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px solid #d6d6d6',
    padding: '20px',
    paddingTop: '30px',
  },
  authorName: {
    fontSize: theme.fontSizeL,
    fontFamily: theme.navFont,
    lineHeight: 2.8,
    cursor: 'pointer',
    color: theme.bgColorDark,
    textDecoration: 'none',
  },
  info: {
    width: '100vw',
    paddingLeft: '20px',
    paddingBottom: '12px',
    paddingTop: '12px',
    fontFamily: 'DINNextLTPro-MediumCond',
    fontSize: '1.4em',
    lineHeight: '2em',
    borderBottom: '1px solid #d6d6d6',
  },
})

export default style
