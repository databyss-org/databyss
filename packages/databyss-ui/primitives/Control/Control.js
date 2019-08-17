import React, { useState, useRef, useEffect } from 'react'
import { Platform } from 'react-native'
import { variant, color, compose } from 'styled-system'
import { animatingCss } from './touchDecay'
import styled from '../styled'
import timing from '../../theming/timing'
import IS_NATIVE from '../../lib/isNative'
import { View } from '../'

const variants = variant({
  prop: 'variant',
  scale: 'controlVariants',
})

/**
 * Base Control component. Optionally renders a label and handles disabled state
 */
const Control = ({
  label,
  onPress,
  variant,
  children,
  disabled,
  ...others
}) => {
  const [decay, setDecay] = useState(false)
  const [resetDecay, setResetDecay] = useState(false)
  const decayTimerRef = useRef(null)
  const Styled = styled(
    {
      ios: disabled ? 'View' : 'TouchableOpacity',
      android: disabled ? 'View' : 'TouchableNativeFeedback',
      default: label ? 'label' : 'div',
    },
    compose(
      variants,
      color
    )
  )

  const startDecayAnimation = () => {
    decayTimerRef.current = setTimeout(() => setDecay(false), timing.touchDecay)
    setDecay(true)
  }

  useEffect(
    () => {
      if (resetDecay) {
        startDecayAnimation()
        setResetDecay(false)
      }
    },
    [resetDecay]
  )

  const webProps = () => ({
    onClick: e => {
      if (disabled) {
        return
      }
      if (decay) {
        clearTimeout(decayTimerRef.current)
        setResetDecay(true)
      } else {
        startDecayAnimation()
      }

      if (onPress) {
        onPress(e)
      }
    },
    css: disabled || (decay && animatingCss),
  })
  const nativeProps = () => ({
    onPress: disabled ? null : onPress,
    ...Platform.select({
      android: {
        useForeground: true,
      },
      default: {},
    }),
  })

  return (
    <Styled
      {...(!IS_NATIVE ? webProps() : nativeProps())}
      variant={disabled ? 'disabled' : variant}
      {...others}
    >
      <View>
        {React.Children.map(
          children,
          child => child && React.cloneElement(child, { disabled })
        )}
      </View>
    </Styled>
  )
}

Control.defaultProps = {
  variant: 'default',
}

export default Control
