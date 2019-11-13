import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Button } from '@databyss-org/ui/primitives'
import ObjectId from 'bson-objectid'

import SourcesProvider, {
  useSourceContext,
} from '@databyss-org/services/sources/SourcesProvider'
import ShowFirstCitation from '@databyss-org/services/sources/ShowFirstCitation'

import reducer, { initialState } from '@databyss-org/services/sources/reducer'
import { ViewportDecorator } from '../decorators'

const _seedValue = {
  authors: [
    {
      firstName: 'Max',
      lastName: 'Stamenov',
    },
  ],
  name: 'Stamenov. Language Structure',
  ranges: [{ offset: 0, length: 2, marks: 'bold' }],
  citations: [
    {
      textValue:
        'Stamenov, Maxim I., editor. Language Structure, Discourse and the Access to Consciousness. Vol. 12, John Benjamins Publishing Company, 1997. Crossref, doi:10.1075/aicr.12.',
      ranges: [],
    },
  ],
  _id: '5dcb069b948335a42b7ec453',
}

const SourcesDemo = () => {
  const [source, setSourceState] = useState('5dcb069b948335a42b7ec453')

  const [getSource, setSource, cache] = useSourceContext()
  return (
    <View>
      <ShowFirstCitation sourceId={source} />
      <Button onPress={() => setSourceState('5dcb06ae948335a42b7ec45a')}>
        switch sources
      </Button>
      <Button onPress={() => setSource(_seedValue)}>seed source 1</Button>
    </View>
  )
}

const Box = ({ children }) => (
  <View borderVariant="thinDark" paddingVariant="tiny" width="100%">
    {children}
  </View>
)

const ProviderDecorator = storyFn => (
  <SourcesProvider initialState={initialState} reducer={reducer}>
    {storyFn()}
  </SourcesProvider>
)

storiesOf('Accounts//Sources', module)
  .addDecorator(ProviderDecorator)
  .addDecorator(ViewportDecorator)
  .add('Load and Save sources', () => (
    <View>
      <Box>
        <SourcesDemo />
      </Box>
    </View>
  ))
