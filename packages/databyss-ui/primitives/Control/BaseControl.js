import React, { forwardRef, useCallback, useMemo } from 'react'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import Control from './native/Control'
import DraggableControl from './native/DraggableControl'
import { View } from '../'
import { useNavigate } from 'react-router-dom'

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
    // const navigate = useNavigationContext((c) => c && c.navigate)
    const navigate = useNavigate()

    const Styled = draggable ? DraggableControl : Control

    const _children = disabled 
      ? React.Children.map(
        children,
        (child) => child && React.cloneElement(child, { disabled })
      ) 
      : children

    const _onPress = useCallback((event) => {
      if (!disabled && typeof onPress === 'function') {
        onPress(event)
      }

      if (
        href &&
        !target &&
        !href.match(/^http/) &&
        !event.defaultPrevented &&
        navigate
      ) {
        event.preventDefault()
        if (!disabled) {
          navigate(href)
        }
      }
    }, [onPress, disabled, href, target, navigate])

    return useMemo(() => (
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
    ), [_children])
  }
)

export default BaseControl
