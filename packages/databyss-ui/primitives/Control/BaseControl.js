import React, { forwardRef } from 'react'
import { Platform } from 'react-native'
import Control, { ControlNoFeedback } from './native/Control'
import { View } from '../'

/**
 * Base Control component that handles disabled state
 */
const BaseControl = forwardRef(
  (
    { onPress, children, disabled, noFeedback, childViewProps, ...others },
    ref
  ) => {
    const Styled = Platform.select({
      ios: disabled || noFeedback ? ControlNoFeedback : Control,
      android: disabled || noFeedback ? ControlNoFeedback : Control,
      default: Control,
    })

    const _children = React.Children.map(
      children,
      child => child && React.cloneElement(child, { disabled })
    )

    return (
      <Styled
        onPress={disabled ? null : onPress}
        disabled={disabled}
        opacity={disabled ? 0.5 : 1}
        ref={ref}
        {...others}
      >
        <View {...childViewProps}>{_children}</View>
      </Styled>
    )
  }
)

export default BaseControl
