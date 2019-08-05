import React from 'react'
import {
  space,
  layout,
  flexbox,
  border,
  position,
  compose,
  variant,
} from 'styled-system'
import styled from '../styled'

const paddingVariant = variant({
  prop: 'paddingVariant',
  scale: 'paddingVariants',
})

const borderVariant = variant({
  prop: 'borderVariant',
  scale: 'borderVariants',
})

const defaultProps = {
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: 'auto',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}

const View = styled(
  {
    ios: 'View',
    android: 'View',
    default: 'div',
  },
  compose(
    space,
    layout,
    flexbox,
    border,
    position,
    paddingVariant,
    borderVariant
  )
)

export default ({ children, ...others }) => (
  <View
    paddingVariant="none"
    borderVariant="none"
    {...defaultProps}
    {...others}
  >
    {children}
  </View>
)
