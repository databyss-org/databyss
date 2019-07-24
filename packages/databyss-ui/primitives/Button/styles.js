import {
  typography,
  color,
  space,
  compose,
  border,
  variant,
} from 'styled-system'

const textSize = variant({
  prop: 'textSize',
  scale: 'textSizes',
})

export default compose(
  typography,
  color,
  space,
  border,
  textSize
)

export const defaultProps = {
  marginBottom: 3,
  borderRadius: 6,
  borderWidth: 2,
  textSize: 'normal',
}
