import React from 'react'
import styled from '@emotion/native'
import styles, { defaultProps } from './styles'

const Text = styled.Text(styles)

export default ({ children, ...others }) => (
  <Text {...defaultProps} {...others}>
    {children}
  </Text>
)
