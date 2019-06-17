import { macros, theme as defaultTheme } from '../../shared-styles'

const style = (theme = defaultTheme) => ({
  authorsModal: {
    lineHeight: 2.5,
  },
  modalContainer: {
    display: 'none',
    ...macros.mobile({
      display: 'block',
    }),
  },
  authorName: {
    fontSize: theme.fontSizeXL,
    cursor: 'pointer',
  },
})

export default style
