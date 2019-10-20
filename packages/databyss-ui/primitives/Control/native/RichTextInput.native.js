import React, { forwardRef } from 'react'
import { TextInput as NativeTextInput } from 'react-native'
import { color, compose } from 'styled-system'
import styled from '../../styled'
import { variants } from '../../Text/Text'

const StyledInput = styled(
  NativeTextInput,
  compose(
    color,
    variants
  )
)

const RichTextInput = forwardRef(({ value, onChange, ...others }, ref) => (
  <StyledInput
    color="text.0"
    value={value.textValue}
    ref={ref}
    onChangeText={value => onChange({ textValue: value })}
    multiline
    flexGrow={0}
    flexShrink={1}
    {...others}
    marginRight={30}
  />
))

RichTextInput.defaultProps = {
  variant: 'uiTextSmall',
  onChange: () => null,
}

export default RichTextInput
