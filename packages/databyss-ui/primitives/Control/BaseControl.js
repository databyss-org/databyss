import React, { forwardRef } from 'react'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import Control from './native/Control'
import DraggableControl from './native/DraggableControl'
import { View } from '../'

/**
 * Base Control component that handles disabled state
 */
const BaseControl = forwardRef(
  (
    {
      onPress,
      children,
      disabled,
      // noFeedback,
      childViewProps,
      href,
      target,
      onKeyDown,
      draggable,
      ...others
    },
    ref
  ) => {
    // may not exist
    const navigationContext = useNavigationContext()

    // may not exist

    const Styled = draggable ? DraggableControl : Control

    const _children = React.Children.map(
      children,
      (child) => child && React.cloneElement(child, { disabled })
    )

    const _onPress = (event) => {
      if (!disabled && typeof onPress === 'function') {
        onPress(event)
      }

      if (
        href &&
        !target &&
        !href.match(/^http/) &&
        !event.defaultPrevented &&
        navigationContext
      ) {
        event.preventDefault()
        if (!disabled) {
          navigationContext.navigate(href)
        }
      }
    }

    return (
      <Styled
        onPress={disabled ? null : _onPress}
        onKeyDown={onKeyDown}
        disabled={disabled}
        opacity={disabled ? 0.5 : 1}
        ref={ref}
        href={href}
        target={target}
        draggable={draggable}
        {...others}
      >
        <View zIndex="base" {...childViewProps}>
          {_children}
        </View>
      </Styled>
    )
  }
)

export default BaseControl
