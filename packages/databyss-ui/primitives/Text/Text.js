import React from 'react'
import styled from '@emotion/styled'

import styles, { defaultProps } from './styles'

const Text = styled.div(styles)

export default ({ children, ...others }) => (
  <Text {...defaultProps} {...others}>
    {children}
  </Text>
)
