import React, { forwardRef } from 'react'
import { variant, flexbox, shadow, layout, compose } from 'styled-system'
import { BaseControl, Text } from '../'
// HACK: if View is imported from '../' above, it breaks storybook:build (reason unknown)
import styled from '../styled'
import buttons from '../../theming/buttons'

const variants = variant({
  prop: 'variant',
  scale: 'buttonVariants',
  variants: {
    // need one member to enable theming
    default: {},
  },
})

const StyledControl = styled(
  BaseControl,
  compose(
    flexbox,
    shadow,
    layout,
    variants
  )
)

const Button = forwardRef(({ onPress, variant, children, ...others }, ref) => {
  let _children = children
  const { buttonVariants, buttonThemes } = buttons
  if (typeof children === 'string') {
    _children = (
      <Text variant="uiTextNormal" color={buttonVariants[variant].color}>
        {children}
      </Text>
    )
  }
  return (
    <StyledControl
      variant={variant}
      onPress={onPress}
      rippleColor={buttonThemes[variant].rippleColor}
      hoverColor={buttonThemes[variant].hoverColor}
      activeColor={buttonThemes[variant].activeColor}
      ref={ref}
      {...others}
    >
      {_children}
    </StyledControl>
  )
})

Button.defaultProps = {
  variant: 'primaryUi',
}

export default Button
