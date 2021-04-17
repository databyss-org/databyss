import React, { forwardRef } from 'react'
import {
  variant,
  color,
  typography,
  compose,
  space,
  layout,
} from 'styled-system'
import styled from '../styled'

export const variants = variant({
  prop: 'variant',
  scale: 'textVariants',
  variants: {
    // need one member to enable theming
    default: {},
  },
})

export const styleProps = compose(variants, color, typography, space, layout)

const Styled = styled(
  {
    ios: 'Text',
    android: 'Text',
    default: 'div',
  },
  styleProps
)

const Text = forwardRef(
  ({ children, color, userSelect, css, ...others }, ref) => (
    // TODO: capture css `white-space` and translate to `numberOfLines` for native
    <Styled
      ref={ref}
      variant="bodyNormal"
      color={color}
      css={{ userSelect, ...css }}
      {...others}
    >
      {children}
    </Styled>
  )
)

Text.defaultProps = {
  color: 'text.0',
  userSelect: 'auto',
  css: {},
}

export default Text
