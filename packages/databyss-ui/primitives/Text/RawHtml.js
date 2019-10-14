import React from 'react'
import { color, compose } from 'styled-system'
import styled from '../styled'
import IS_NATIVE from '../../lib/isNative'
import { variants } from './Text'

const Styled = styled(
  {
    ios: 'Text',
    android: 'Text',
    default: 'span',
  },
  compose(
    variants,
    color
  )
)

const RawHtml = ({ _html, ...others }) => {
  if (IS_NATIVE) {
    throw new Error('Component not availablle in React Native')
  }
  return <Styled dangerouslySetInnerHTML={_html} {...others} />
}

RawHtml.defaultProps = {
  color: 'text.0',
}

export default RawHtml
