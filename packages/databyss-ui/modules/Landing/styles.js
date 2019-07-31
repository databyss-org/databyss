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
    position: 'fixed',
    transform: 'translate(0, -400px)',
  },
  transition: {
    transition: 'transform 200ms ease-in-out',
  },
  stickyContainer: {
    transform: 'translate(0, 0)',
    backgroundColor: 'white',
    top: '77px',
    left: '0px',
    width: '100%',
    position: 'fixed',
    paddingTop: '30px',
    paddingRight: '20px',
    ...macros.mobile({
      paddingRight: '0px',
    }),
    zIndex: 11,
    justifyContent: 'center',
    display: 'flex',
  },
  stickyContent: {
    borderBottom: '1px solid #D6D6D6',
    ...macros.mobile({
      paddingRight: '18px',
      paddingLeft: '18px',
      borderBottom: 0,
      width: '100%',
    }),
    maxWidth: '550px',
  },
  bottomBorder: {
    ...macros.mobile({
      borderBottom: '1px solid #D6D6D6',
    }),
  },
})
export default style
