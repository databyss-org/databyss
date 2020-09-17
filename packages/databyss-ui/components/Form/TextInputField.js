import React, { useState } from 'react'
import {
  ValueListItem,
  useValueListContext,
} from '../ValueList/ValueListProvider'
import { View, Text, TextInput } from '../../primitives'

const TextInputField = React.forwardRef(
  (
    { path, label, placeholder, errorMessage, textInputProps, ...others },
    ref
  ) => {
    const { onSubmit } = useValueListContext()
    const [active, setActive] = useState(false)

    let outlineColor = active ? 'activeFormField' : 'formField'

    if (errorMessage) {
      outlineColor = 'formError'
    }

    return (
      <View {...others}>
        {label && (
          <View mb="tiny">
            <Text
              variant="uiTextNormal"
              color={active ? 'primary.0' : 'text.1'}
            >
              {label}
            </Text>
          </View>
        )}
        <View
          padding="small"
          borderVariant={outlineColor}
          backgroundColor={active ? 'background.0' : 'transparent'}
        >
          <ValueListItem path={path}>
            <TextInput
              variant="uiTextNormal"
              onFocus={() => setActive(true)}
              onBlur={() => setActive(false)}
              onKeyUp={e => e.keyCode === 13 && onSubmit()}
              placeholder={placeholder}
              ref={ref}
              {...textInputProps}
            />
          </ValueListItem>
        </View>
        {errorMessage && (
          <View m="tiny">
            <Text variant="uiTextSmall" color="red.0">
              {errorMessage}
            </Text>
          </View>
        )}
      </View>
    )
  }
)

export default TextInputField
