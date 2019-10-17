import React, { forwardRef } from 'react'
import { color, compose } from 'styled-system'
import styled from '../styled'
import IS_NATIVE from '../../lib/isNative'
import { variants } from './Text'

const Styled = styled(
  'span',
  compose(
    variants,
    color
  )
)

const RawHtml = forwardRef(({ _html, ...others }, ref) => {
  if (IS_NATIVE) {
    throw new Error('Component not availablle in React Native')
  }
  return <Styled ref={ref} dangerouslySetInnerHTML={_html} {...others} />
})

RawHtml.defaultProps = {
  color: 'text.0',
}

export default RawHtml
