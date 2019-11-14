import React from 'react'
import { ScrollView } from 'react-native'
import styled from '../styled'
import View, { styleProps } from './View'
import IS_NATIVE from '../../lib/isNative'

const Styled = IS_NATIVE ? styled(ScrollView, styleProps) : View

export default ({ children, ...others }) => {
  const webProps = {
    overflowY: 'auto',
    overflowX: 'hidden',
    css: {
      overscrollBehavior: 'contain',
      WebkitOverflowScrolling: 'touch',
    },
  }
  const nativeProps = {}
  return (
    <Styled {...(IS_NATIVE ? nativeProps : webProps)} {...others}>
      {children}
      {IS_NATIVE && <View height={50} />}
    </Styled>
  )
}
