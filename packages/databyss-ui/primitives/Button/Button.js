import React, { forwardRef } from 'react'
import {
  variant,
  flexbox,
  shadow,
  layout,
  compose,
  border,
} from 'styled-system'
import BaseControl from '../Control/BaseControl' // HACK: we can't import BaseControl from index.js for some reason
import { Text } from '../'
import { shadowVariant } from '../View/View'
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
    variants,
    shadowVariant,
    border
  )
)

const Button = forwardRef(
  ({ onPress, variant, children, textVariant, ...others }, ref) => {
    let _children = children
    const { buttonVariants, buttonThemes } = buttons
    if (
      Array.isArray(_children) &&
      _children.filter(c => typeof c !== 'string').length === 0
    ) {
      _children = _children.join(' ')
    }
    if (typeof _children === 'string') {
      _children = (
        <Text
          variant={textVariant}
          color={buttonVariants[variant].color}
          {...(buttonThemes[variant].textProps
            ? buttonThemes[variant].textProps
            : {})}
        >
          {children}
        </Text>
      )
    }

    return (
      <StyledControl
        variant={variant}
        onPress={onPress}
        hoverColor={buttonThemes[variant].hoverColor}
        activeColor={buttonThemes[variant].activeColor}
        ref={ref}
        {...others}
      >
        {_children}
      </StyledControl>
    )
  }
)

Button.defaultProps = {
  variant: 'primaryUi',
  shadowVariant: 'none',
  textVariant: 'uiTextNormal',
}

export default Button
