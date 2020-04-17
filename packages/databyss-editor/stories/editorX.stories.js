import React, { useState, useMemo } from 'react'
import { storiesOf } from '@storybook/react'
import { Editable, withReact, Slate } from 'slate-react'
import { createEditor } from 'slate'
import { View } from '@databyss-org/ui/primitives'
import { ViewportDecorator } from '@databyss-org/ui/stories/decorators'

const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'This is editable ' }],
  },
]

const SlateDemo = () => {
  const editor = useMemo(() => withReact(createEditor()), [])

  const [slateValue, setSlateValue] = useState(initialValue)
  const [count, setCount] = useState(0)

  const onChange = value => {
    console.log('onchange')
    setSlateValue(value)
    setTimeout(() => {
      console.log('rerender')
      setCount(count + 1)
    }, 3000)
  }

  return (
    <Slate editor={editor} value={slateValue} onChange={onChange}>
      <Editable onBlur={() => console.log('onblur')} />
    </Slate>
  )
}

const Box = ({ children, ...others }) => (
  <View borderVariant="thinDark" paddingVariant="none" width="100%" {...others}>
    {children}
  </View>
)

storiesOf('Slate//Slate 5 Implementation', module)
  .addDecorator(ViewportDecorator)
  .add('Slate', () => (
    <View>
      <input type="text" />
      <Box>
        <SlateDemo />
      </Box>
    </View>
  ))
