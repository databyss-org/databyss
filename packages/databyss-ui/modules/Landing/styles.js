import { macros, theme as defaultTheme } from '../../shared-styles'

const style = (theme = defaultTheme) => ({
  sourcesToc: {
    fontFamily: theme.bodyFont,
  },

  bottomHeaderContainer: {
    ...macros.mobile({
      display: 'flex',
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: '20px',
    }),
  },
  landing: {
    display: 'flex',
    flexDirection: 'column',
  },

  notSticky: {
    paddingTop: '0px',
    position: 'sticky',
    transform: 'translate(0, -500px)',
  },

  sticky: {
    paddingTop: '24px',
    zIndex: 2,
    position: 'sticky',
    borderBottom: '1px solid #D6D6D6',
  },
})
export default style
