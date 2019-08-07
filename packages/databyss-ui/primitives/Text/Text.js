import React from 'react'
import { variant, color, compose, typography } from 'styled-system'
import styled from '../styled'

const variants = variant({
  prop: 'variant',
  scale: 'textVariants',
})

const Text = styled(
  {
    ios: 'Text',
    android: 'Text',
    default: 'div',
  },
  compose(
    variants,
    color,
    typography
  )
)

export default ({ children, ...others }) => (
  <Text variant="bodyNormal" {...others}>
    {children}
  </Text>
)
