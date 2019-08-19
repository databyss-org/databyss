import React, { useState } from 'react'
import styled from '../styled'
import styles, { defaultProps, themes } from './styles'
import IS_NATIVE from '../../lib/isNative'

const { primary } = themes

const TextInput = styled(
  {
    ios: 'TextInput',
    android: 'TextInput',
    default: 'input',
  },
  styles
)

export default ({ children, value, onChange, ...others }) => {
  const [inputValue, setInputValue] = useState(value)
  const onValueChange = evt => {
    onChange(evt)
    setInputValue(IS_NATIVE ? evt : evt.target.value)
  }

  const [hover, setHover] = useState(false)
  const toggleHover = () => {
    setHover(!hover)
  }

  const [focus, setFocus] = useState(false)

  const sharedProps = {
    ...defaultProps,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    value: inputValue,
  }

  const sharedStyle = {
    borderColor: focus ? primary.borderColorActive : primary.borderColor,
  }

  const webProps = {
    ...sharedProps,
    onChange: onValueChange,
    onMouseEnter: toggleHover,
    onMouseLeave: toggleHover,
    style: {
      ...sharedStyle,
      outline: 'none',
      backgroundColor: hover ? primary.backgroundHover : 'white',
    },
  }

  const nativeProps = {
    ...sharedProps,
    onChangeText: onValueChange,
    style: {
      ...sharedStyle,
    },
  }

  return (
    <TextInput {...(!IS_NATIVE ? webProps : nativeProps)} {...others}>
      {children}
    </TextInput>
  )
}
