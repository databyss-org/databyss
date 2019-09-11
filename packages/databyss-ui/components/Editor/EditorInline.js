import React from 'react'
import { color } from 'styled-system'
import styled from '@emotion/styled'

const Styled = styled('span')(color)

const EditorInline = React.forwardRef(
  ({ isFocused, children, ...others }, ref) => {
    const styleProps = isFocused
      ? {
          bg: 'selectionHighlight',
        }
      : {}
    return (
      <Styled {...styleProps} {...others} ref={ref}>
        {children}
      </Styled>
    )
  }
)

export default EditorInline
