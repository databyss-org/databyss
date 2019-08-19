import React from 'react'
import { variant, flexbox, compose } from 'styled-system'
import { View, BaseControl, Text } from '../'
import styled from '../styled'
import buttons from '../../theming/buttons'

const variants = variant({
  prop: 'variant',
  scale: 'buttonVariants',
})

const StyledView = styled(
  View,
  compose(
    flexbox,
    variants
  )
)

const Button = ({ onPress, variant, children, ...others }) => {
  let _children = children
  const { buttonVariants } = buttons
  if (typeof children === 'string') {
    _children = (
      <Text variant="uiTextNormal" color={buttonVariants[variant].color}>
        {children}
      </Text>
    )
  }
  return (
    <BaseControl
      onPress={onPress}
      rippleColor={buttonVariants[variant].rippleColor}
      {...others}
    >
      <StyledView variant={variant}>{_children}</StyledView>
    </BaseControl>
  )
}

Button.defaultProps = {
  variant: 'primaryUi',
}

export default Button
