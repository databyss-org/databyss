import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import styledCss from '@styled-system/css'
import { View, TextInput } from '@databyss-org/ui/primitives'
import { theme } from '@databyss-org/ui/theming'
import { ViewportDecorator } from './decorators'

const TextInputWithPlaceholder = () => {
  const [value, setValue] = useState({ textValue: '' })
  return (
    <TextInput
      placeholder="enter title"
      value={value}
      onChange={setValue}
      concatCss={styledCss({
        '::placeholder': {
          color: 'purple.2',
        },
      })(theme)}
    />
  )
}

storiesOf('Text Input with Placeholder', module)
  .addDecorator(ViewportDecorator)
  .add('default', () => (
    <View>
      <TextInputWithPlaceholder />
    </View>
  ))
