import React from 'react'
import { variant, color, compose } from 'styled-system'
import styled from '../styled'

const variants = variant({
  prop: 'variant',
  scale: 'textVariants',
})

const Styled = styled(
  {
    ios: 'Text',
    android: 'Text',
    default: 'div',
  },
  compose(
    variants,
    color
  )
)

const StyledInline = styled(
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

const Text = ({ children, color, inline, _html, ...others }) => {
  return inline ? (
    <StyledInline dangerouslySetInnerHTML={_html} {...others} />
  ) : (
    <Styled variant="bodyNormal" color={color} {...others}>
      {children}
    </Styled>
  )
}

Text.defaultProps = {
  color: 'text.0',
}

export default Text
