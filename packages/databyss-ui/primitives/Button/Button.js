import React, { useState } from 'react'
import theme from '@databyss-org/ui/theming/theme'
import { TouchableHighlight, Text } from 'react-native'
import _ from 'lodash'

import styled from '../styled'
import styles, { defaultProps, themes } from './styles'
import IS_NATIVE from './../isNative'

const { fontSizes } = theme

const Button = styled(
  {
    ios: 'View',
    android: 'View',
    default: 'button',
  },
  styles
)

export default ({ label, onClick, style, ...others }) => {
  const [hover, setHover] = useState(false)
  const toggleHover = () => {
    setHover(!hover)
  }

  const [click, setClick] = useState(false)
  const isClick = bool => {
    setClick(bool)
  }

  const buttonStyle = !_.isEmpty(style) ? style : 'primary'

  const sharedProps = {
    ...defaultProps,
  }

  const sharedStyle = {
    height: 40,
    borderColor: themes[buttonStyle].borderColor,
  }

  const backgroundColor = () => {
    if (hover) {
      if (click) {
        return themes[buttonStyle].pressed
      }
      return themes[buttonStyle].hover
    }
    return themes[buttonStyle].primary
  }

  const webProps = {
    ...sharedProps,
    type: 'button',
    onMouseEnter: toggleHover,
    onMouseLeave: toggleHover,
    onMouseDown: () => isClick(true),
    onMouseUp: () => isClick(false),
    onClick,
    style: {
      ...sharedStyle,
      outline: 'none',
      color: themes[buttonStyle].fontColor,
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
      underlayColor={themes[buttonStyle].pressed}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: themes[buttonStyle].primary,
        // padding: 14,
      }}
    >
      <Text
        style={{
          color: themes[buttonStyle].fontColor,
          fontSize: fontSizes.normal,
        }}
      >
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
