import React, { forwardRef } from 'react'
import { Platform } from 'react-native'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useDrag } from '@databyss-org/ui/primitives/Gestures/GestureProvider'
import Control, { ControlNoFeedback } from './native/Control'
import { View } from '../'

const DraggableView = ({ children, draggable, ...others }) => {
  let draggableItem = { type: 'BaseControl' }
  if (typeof draggable !== 'boolean') {
    draggableItem = { ...draggableItem, ...draggable }
  }
  const [, dragRef] = useDrag({
    item: draggableItem,
  })
  return (
    <View ref={dragRef} {...others}>
      {children}
    </View>
  )
}

/**
 * Base Control component that handles disabled state
 */
const BaseControl = forwardRef(
  (
    {
      onPress,
      children,
      disabled,
      noFeedback,
      childViewProps,
      href,
      onKeyDown,
      draggable,
      ...others
    },
    ref
  ) => {
    // may not exist
    const navigationContext = useNavigationContext()

    // may not exist

    const Styled = Platform.select({
      ios: disabled || noFeedback ? ControlNoFeedback : Control,
      android: disabled || noFeedback ? ControlNoFeedback : Control,
      default: Control,
    })

    const _children = React.Children.map(
      children,
      (child) => child && React.cloneElement(child, { disabled })
    )

    const _onPress = (event) => {
      if (typeof onPress === 'function') {
        onPress(event)
      }

      if (
        href &&
        !href.match(/^http/) &&
        !event.defaultPrevented &&
        navigationContext
      ) {
        event.preventDefault()
        navigationContext.navigate(href)
      }
    }

    const ChildView = draggable ? DraggableView : View

    return (
      <Styled
        onPress={disabled ? null : _onPress}
        onKeyDown={onKeyDown}
        disabled={disabled}
        opacity={disabled ? 0.5 : 1}
        ref={ref}
        href={href}
        draggable={draggable}
        {...others}
      >
        <ChildView zIndex="base" {...childViewProps} draggable={draggable}>
          {_children}
        </ChildView>
      </Styled>
    )
  }
)

export default BaseControl
