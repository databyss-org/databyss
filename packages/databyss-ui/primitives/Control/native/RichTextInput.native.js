import React, { forwardRef } from 'react'
import { TextInput as NativeTextInput } from 'react-native'
import { color, compose, space, flexbox } from 'styled-system'
import styled from '../../styled'
import { variants } from '../../Text/Text'

const StyledInput = styled(
  NativeTextInput,
  compose(
    space, // HACK: shouldn't need this but iOS puts 5px paddingTop
    color,
    flexbox,
    variants
  )
)

const RichTextInput = forwardRef(
  ({ value, onChange, multiline, ...others }, ref) => (
    <StyledInput
      color="text.0"
      value={value.textValue}
      ref={ref}
      onChangeText={value => onChange({ textValue: value })}
      multiline={multiline}
      flexGrow={0}
      flexShrink={1}
      paddingTop={0}
      {...others}
    />
  )
)

RichTextInput.defaultProps = {
  variant: 'uiTextSmall',
  onChange: () => null,
}

export default RichTextInput
