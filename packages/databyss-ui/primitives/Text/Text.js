import React from 'react'
import { variant, color, typography, compose, space } from 'styled-system'
import styled from '../styled'

export const variants = variant({
  prop: 'variant',
  scale: 'textVariants',
  variants: {
    // need one member to enable theming
    default: {},
  },
})

const Styled = styled(
  {
    ios: 'Text',
    android: 'Text',
    default: 'div',
  },
  compose(
    variants,
    color,
    typography,
    space
  )
)

const Text = ({ children, color, ...others }) => (
  <Styled variant="bodyNormal" color={color} {...others}>
    {children}
  </Styled>
)

Text.defaultProps = {
  color: 'text.0',
}

export default Text
