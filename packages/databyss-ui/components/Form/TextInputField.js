import React, { useState } from 'react'
import {
  ValueListItem,
  useValueListContext,
} from '../ValueList/ValueListProvider'
import { View, Text, TextInput } from '../../primitives'

const TextInputField = ({ path, label, placeholder, ...others }) => {
  const { onSubmit } = useValueListContext()
  const [active, setActive] = useState(false)
  return (
    <View {...others}>
      {label && (
        <View mb="tiny">
          <Text variant="uiTextNormal" color={active ? 'primary.0' : 'text.1'}>
            {label}
          </Text>
        </View>
      )}
      <View
        padding="small"
        borderVariant={active ? 'activeFormField' : 'formField'}
        backgroundColor={active ? 'background.0' : 'transparent'}
      >
        <ValueListItem path={path}>
          <TextInput
            variant="uiTextNormal"
            onFocus={() => setActive(true)}
            onBlur={() => setActive(false)}
            onKeyUp={e => e.keyCode === 13 && onSubmit()}
            placeholder={placeholder}
          />
        </ValueListItem>
      </View>
    </View>
  )
}

export default TextInputField
