import { typography, color, space, compose, border } from 'styled-system'

console.log(border)

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
