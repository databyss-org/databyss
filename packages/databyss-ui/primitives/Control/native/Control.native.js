import React from 'react'
import { Platform, View } from 'react-native'
import { color, layout, compose } from 'styled-system'
import styled from '../../styled'

const Styled = styled(
  {
    ios: 'TouchableOpacity',
    android: 'TouchableNativeFeedback',
  },
  compose(
    color,
    layout
  )
)

export const ControlNoFeedback = Platform.select({
  ios: () => Styled.withComponent(View),
  android: () => Styled.withComponent(View),
})()

export default ({ children, ...others }) => (
  <Styled
    {...Platform.select({
      android: {
        useForeground: true,
      },
      default: {},
    })}
    {...others}
  >
    {children}
  </Styled>
)
