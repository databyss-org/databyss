import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Text } from '@databyss-org/ui/primitives'
import { ViewportDecorator } from '@databyss-org/ui/stories/decorators'
import fetchMock from 'fetch-mock'
import SourceProvider from '@databyss-org/services/sources/SourceProvider'
import sourceReducer, {
  initialState as sourceInitialState,
} from '@databyss-org/services/sources/reducer'
import TopicProvider from '@databyss-org/services/topics/TopicProvider'
import topicReducer, {
  initialState as topicInitialState,
} from '@databyss-org/services/topics/reducer'
import NavigationProvider from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import SingleLine from '../components/SingleLine'
import EditorProvider from '../state/EditorProvider'
import { sourceFixture, topicFixture } from './fixtures/refEntities'
import blankState from './fixtures/blankState'

const Box = ({ children, ...others }) => (
  <View borderVariant="thinDark" paddingVariant="tiny" width="100%" {...others}>
    {children}
  </View>
)

storiesOf('Cypress//Tests', module)
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
