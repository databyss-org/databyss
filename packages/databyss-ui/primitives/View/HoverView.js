import React, { forwardRef } from 'react'
import {
  variant,
  flexbox,
  shadow,
  layout,
  compose,
  border,
} from 'styled-system'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import styled from '../styled'
import IS_NATIVE from '../../lib/isNative'

const variants = variant({
  prop: 'variant',
  scale: 'hoverVariants',
  variants: {
    // need one member to enable theming
    default: {},
  },
})

const Styled = styled(
  'div',
  compose(
    flexbox,
    shadow,
    layout,
    variants,
    border
  )
)

const HoverView = forwardRef(({ children, ...others }, ref) => {
  if (IS_NATIVE) {
    throw new Error('Component not availablle in React Native')
  }

  return (
    <Styled {...others} ref={ref}>
      <Grid singleRow columnGap={0}>
        {children}
      </Grid>
    </Styled>
  )
})

HoverView.defaultProps = {
  variant: 'formatMenuUI',
}

export default HoverView
