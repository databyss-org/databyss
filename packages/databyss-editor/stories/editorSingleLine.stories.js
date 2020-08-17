import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Text } from '@databyss-org/ui/primitives'
import { ViewportDecorator } from '@databyss-org/ui/stories/decorators'
import SingleLine from '../components/SingleLine'

const Box = ({ children, ...others }) => (
  <View borderVariant="thinDark" paddingVariant="tiny" width="100%" {...others}>
    {children}
  </View>
)

storiesOf('Selenium//Tests', module)
  .addDecorator(ViewportDecorator)
  .add('Slate 5 - single', () => {
    const _initial = {
      textValue:
        'Stamenov, Language Structure, Discourse and the Access to Consciousness',
      ranges: [{ offset: 0, length: 8, marks: ['bold'] }],
    }

    const [state, setState] = useState(_initial)

    return (
      <View>
        <SingleLine multiline onChange={setState} initialValue={state} />
        <Box maxHeight="300px" overflow="scroll" flexShrink={1}>
          <Text variant="uiTextLargeSemibold">Page State</Text>
          <pre id="pageDocument">{JSON.stringify(state, null, 2)}</pre>
        </Box>
      </View>
    )
  })
