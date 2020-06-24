import React, { useState } from 'react'
import {
  ValueListItem,
  useValueListContext,
} from '../ValueList/ValueListProvider'
import { View, Text, TextInput } from '../../primitives'

const TextInputField = React.forwardRef(
  ({ path, label, placeholder, hasError, ...others }, ref) => {
    const { onSubmit } = useValueListContext()
    const [active, setActive] = useState(false)

    const outlineColor = !hasError
      ? active
        ? 'activeFormField'
        : 'formField'
      : 'formError'
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
            />
          </ValueListItem>
        </View>
      </View>
    )
  }
)

export default TextInputField
