import { typography, color, space, variant, compose } from 'styled-system'

const textSize = variant({
  prop: 'textSize',
  scale: 'textSizes',
})

export default compose(
  typography,
  color,
  space,
  textSize
)

export const defaultProps = {
  fontFamily: 'bodyFont',
  textSize: 'normal',
  // TODO: create a function that does a "mediaQuery" on native and returns the appropriate value
  color: 'darkText',
  marginBottom: 2,
}
