import React, { forwardRef } from 'react'
import Textarea from 'react-textarea-autosize'
import styled from '../../styled'
import { styleProps } from '../../Text/Text'

const resetCss = {
  background: 'transparent',
  padding: 0,
  outline: 'none',
  border: 'none',
  resize: 'none',
}

const StyledInput = styled('input', styleProps)
const StyledTextarea = styled(Textarea, styleProps)

const TextInput = forwardRef(
  ({ value, onChange, multiline, concatCss, active, ...others }, ref) =>
    multiline ? (
      <StyledTextarea
        onChange={e => onChange({ textValue: e.target.value })}
        inputRef={ref || undefined}
        css={[resetCss].concat(concatCss)}
        value={value.textValue}
        {...others}
      />
    ) : (
      <StyledInput
        type="text"
        value={value.textValue}
        onChange={e => onChange({ textValue: e.target.value })}
        ref={ref}
        css={[resetCss].concat(concatCss)}
        {...others}
      />
    )
)

TextInput.defaultProps = {
  color: 'text.0',
}

export default TextInput
