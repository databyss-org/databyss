import React, { useState, useRef } from 'react'
import { storiesOf } from '@storybook/react'
import { Editor } from 'slate-react'
import { Value } from 'slate'
import { View } from '@databyss-org/ui/primitives'
import { ViewportDecorator } from './decorators'

const schema = {
  document: {
    nodes: [
      {
        match: [{ type: 'ENTRY' }],
      },
    ],
  },
  blocks: {
    ENTRY: {
      nodes: [
        {
          match: { object: 'text' },
        },
      ],
    },
  },
}

const SlateDemo = ({ initialString }) => {
  const initialValue = Value.fromJSON({
    document: {
      nodes: [
        {
          object: 'block',
          type: 'ENTRY',
          nodes: [
            {
              object: 'text',
              text: initialString,
            },
          ],
        },
      ],
    },
  })
  const [slateValue, setSlateValue] = useState(initialValue)
  const [count, setCount] = useState(0)

  const onChange = ({ value }) => {
    console.log('onchange')
    setSlateValue(value)
    setTimeout(() => setCount(count + 1), 3000)
  }

  return (
    <Editor
      value={slateValue}
      onChange={onChange}
      schema={schema}
      onBlur={() => console.log('onblur')}
    />
  )
}

const Box = ({ children, ...others }) => (
  <View borderVariant="thinDark" paddingVariant="none" width="100%" {...others}>
    {children}
  </View>
)

storiesOf('Slate//Slate 4 Implementation', module)
  .addDecorator(ViewportDecorator)
  .add('Slate', () => (
    <View>
      <input type="text" />
      <Box>
        <SlateDemo />
      </Box>
    </View>
  ))
