import React, { useState, useRef } from 'react'
import { Platform } from 'react-native'
import { variant, color, compose } from 'styled-system'
import touchDecayCss, { animatingCss } from './touchDecay'
import styled from '../styled'
import timing from '../../theming/timing'
import IS_NATIVE from '../../lib/isNative'
import { View } from '../'

const variants = variant({
  prop: 'variant',
  scale: 'controlVariants',
})

const Control = ({ label, onPress, variant, children, ...others }) => {
  const [decay, setDecay] = useState(false)
  const decayTimerRef = useRef(null)
  const Styled = styled(
    {
      ios: 'TouchableOpacity',
      android: 'TouchableNativeFeedback',
      default: label ? 'label' : 'div',
    },
    compose(
      variants,
      color
    )
  )

  const webProps = () => ({
    onClick: () => {
      clearTimeout(decayTimerRef.current)
      decayTimerRef.current = setTimeout(
        () => setDecay(false),
        timing.touchDecay
      )
      setDecay(true)
      if (onPress) {
        onPress()
      }
    },
    css: [touchDecayCss, decay && animatingCss],
  })
  const nativeProps = () => ({
    onPress,
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
      variant={variant}
      {...others}
    >
      <View>{children}</View>
    </Styled>
  )
}

Control.defaultProps = {
  variant: 'default',
}

export default Control
