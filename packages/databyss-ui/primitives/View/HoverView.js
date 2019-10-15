import React, { forwardRef } from 'react'
import {
  variant,
  flexbox,
  shadow,
  layout,
  compose,
  border,
} from 'styled-system'
import styled from '../styled'
import IS_NATIVE from '../../lib/isNative'

const variants = variant({
  prop: 'variant',
  scale: 'hoverVariants',
  variants: {
    // need one member to enable theming
    default: {},
  },
})

const Styled = styled(
  'div',
  compose(
    flexbox,
    shadow,
    layout,
    variants,
    border
  )
)

const HoverView = forwardRef(({ children, ...others }, ref) => {
  const webProps = {
    css: {},
  }
  return (
    <Styled {...webProps} {...others} ref={ref}>
      {children}
    </Styled>
  )
})

HoverView.defaultProps = {
  variant: 'formatMenuUI',
}

export default HoverView
