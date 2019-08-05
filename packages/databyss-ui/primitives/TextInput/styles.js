import { typography, color, space, compose, border } from 'styled-system'
import theme from '@databyss-org/ui/theming/theme'

const { colors } = theme

export default compose(
  typography,
  color,
  space,
  border
)

export const defaultProps = {
  fontFamily: 'uiFont',
  padding: 2,
  fontSize: 1,
  color: 'darkText',
  boxShadow: 'none',
  marginBottom: 2,
  borderRadius: 6,
  borderWidth: 2,
  borderStyle: 'solid',
}

export const themes = {
  primary: {
    backgroundHover: colors.gray[6],
    backgroundDisabled: colors.gray[5],
    borderColor: colors.gray[4],
    borderColorActive: colors.black,
    fontColor: colors.gray[4],
  },
}
