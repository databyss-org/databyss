import { typography, color, space, compose } from 'styled-system'

export default compose(
  typography,
  color,
  space
)

export const defaultProps = {
  fontFamily: 'uiFont',
  color: 'darkText',
  marginBottom: 2,
}
