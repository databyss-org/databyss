import React, { forwardRef } from 'react'
import Textarea from 'react-textarea-autosize'
import styled from '../../styled'
import { styleProps } from '../../Text/Text'

const resetCss = {
  background: 'transparent',
  padding: 0,
  margin: 0,
  outline: 'none',
  border: 'none',
  resize: 'none',
}

const StyledInput = styled('input', styleProps)
const StyledTextarea = styled(Textarea, styleProps)

const TextInput = forwardRef(
  (
    {
      value,
      onChange,
      multiline,
      active,
      concatCss,
      readonly,
      autoFocus,
      ...others
    },
    ref
  ) =>
    multiline ? (
      <StyledTextarea
        readOnly={readonly}
        onChange={e => onChange({ textValue: e.target.value })}
        inputRef={ref || undefined}
        css={[resetCss].concat(concatCss)}
        value={value.textValue}
        autoFocus={autoFocus}
        active={active || undefined}
        {...others}
      />
    ) : (
      <StyledInput
        readOnly={readonly}
        type="text"
        value={value.textValue}
        onChange={e => onChange({ textValue: e.target.value })}
        ref={ref}
        css={[resetCss].concat(concatCss)}
        autoFocus={autoFocus}
        {...others}
      />
    )
)

TextInput.defaultProps = {
  color: 'text.0',
  variant: 'bodyNormal',
}

export default TextInput
