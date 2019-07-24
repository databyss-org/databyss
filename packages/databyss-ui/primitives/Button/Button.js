import React, { useState } from 'react'
import theme from '@databyss-org/ui/theming/theme'
import { TouchableHighlight, Text } from 'react-native'

import styled from '../styled'
import styles, { defaultProps } from './styles'
import IS_NATIVE from './../isNative'

const { colors, fontSizes } = theme
const Button = styled(
  {
    ios: 'View',
    android: 'View',
    default: 'button',
  },
  styles
)

console.log(fontSizes)
export default ({ label, onChange, ...others }) => {
  const [hover, setHover] = useState(false)
  const toggleHover = () => {
    setHover(!hover)
  }

  const [click, setClick] = useState(false)
  const isClick = bool => {
    setClick(bool)
  }

  const sharedProps = {
    ...defaultProps,
  }

  const sharedStyle = {}

  const backgroundColor = () => {
    if (hover) {
      if (click) {
        return colors.blues[0]
      }
      return colors.blues[3]
    }
    return colors.blues[1]
  }

  const webProps = {
    ...sharedProps,
    type: 'button',
    onMouseEnter: toggleHover,
    onMouseLeave: toggleHover,
    onMouseDown: () => isClick(true),
    onMouseUp: () => isClick(false),
    style: {
      ...sharedStyle,
      outline: 'none',
      color: colors.white,
      backgroundColor: backgroundColor(),
    },
  }

  const nativeProps = {
    ...sharedProps,
    style: {
      ...sharedStyle,
      flexDirection: 'row',
    },
  }

  const ButtonLabel = IS_NATIVE ? (
    <TouchableHighlight
      onPress={() => console.log('pressed')}
      underlayColor={colors.blues[0]}
      style={{
        flex: 1,
        alignItems: 'center',
        backgroundColor: colors.blues[1],
        padding: 14,
      }}
    >
      <Text style={{ color: colors.white, fontSize: fontSizes.normal }}>
        {label}
      </Text>
    </TouchableHighlight>
  ) : (
    <div>{label}</div>
  )

  return (
    <Button {...(!IS_NATIVE ? webProps : nativeProps)} {...others}>
      {ButtonLabel}
    </Button>
  )
}
