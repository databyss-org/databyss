import React from 'react'
import styled from '../styled'
import styles, { defaultProps } from './styles'

const Text = styled(
  {
    ios: 'Text',
    android: 'Text',
    default: 'div',
  },
  styles
)

export default ({ children, ...others }) => (
  <Text {...defaultProps} {...others}>
    {children}
  </Text>
)
