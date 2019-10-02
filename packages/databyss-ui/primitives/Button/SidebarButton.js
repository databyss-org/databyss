import React from 'react'
import { variant, flexbox, compose, border } from 'styled-system'
import { BaseControl, Text } from '../'
// HACK: if View is imported from '../' above, it breaks storybook:build (reason unknown)
import View from '../View/View'
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
    border,
    variants
  )
)

const SidebarButton = ({ onPress, variant, children, ...others }) => {
  let _children = children
  const { buttonVariants } = buttons
  if (typeof children === 'string') {
    _children = (
      <Text variant="uiTextExtraSmall" color={buttonVariants[variant].color}>
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

SidebarButton.defaultProps = {
  variant: 'sidebarAction',
}

export default SidebarButton
