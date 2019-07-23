import React, { useState } from 'react'
import { Platform } from 'react-native'
import styled from '../styled'
import styles, { defaultProps } from './styles'

const TextInput = styled(
  {
    ios: 'TextInput',
    android: 'TextInput',
    default: 'input',
  },
  styles
)

export default ({ children, value, ...others }) => {
  const [inputValue, setInputValue] = useState(value)
  const onChange = evt => {
    setInputValue(
      Platform.select({
        ios: () => evt,
        android: () => evt,
        default: () => evt.target.value,
      })()
    )
  }

  const handlerProps = {
    [Platform.select({
      ios: 'onChangeText',
      android: 'onChangeText',
      default: 'onChange',
    })]: onChange,
  }
  return (
    <TextInput
      {...defaultProps}
      value={inputValue}
      {...handlerProps}
      {...others}
    >
      {children}
    </TextInput>
  )
}
