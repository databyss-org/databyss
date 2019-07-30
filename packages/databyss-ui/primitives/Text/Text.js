import React from 'react'
import { variant } from 'styled-system'
import styled from '../styled'

const styles = variant({
  prop: 'variant',
  scale: 'textVariants',
})

const Text = styled(
  {
    ios: 'Text',
    android: 'Text',
    default: 'div',
  },
  styles
)

export default ({ children, ...others }) => (
  <Text variant="bodyNormal" {...others}>
    {children}
  </Text>
)
