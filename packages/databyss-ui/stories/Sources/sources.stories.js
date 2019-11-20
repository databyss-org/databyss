import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Button, TextControl } from '@databyss-org/ui/primitives'
import ObjectId from 'bson-objectid'

import SourceProvider, {
  useSourceContext,
  withSource,
} from '@databyss-org/services/sources/SourceProvider'

import reducer, { initialState } from '@databyss-org/services/sources/reducer'
import { ViewportDecorator } from '../decorators'

const _id1 = ObjectId().toHexString()
const _id2 = ObjectId().toHexString()

const _seedValue1 = {
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
      ranges: [{ length: 10, offset: 0, marks: ['bold'] }],
    },
  ],
  _id: _id1,
}

const _seedValue2 = {
  authors: [
    {
      firstName: 'Max',
      lastName: 'Stamenov',
    },
  ],
  name: 'Second',
  ranges: [{ offset: 0, length: 2, marks: 'bold' }],
  citations: [
    {
      textValue: 'Second Source',
      ranges: [],
    },
  ],
  _id: _id2,
}

const EditFirstCitation = withSource(({ source }) => {
  const [, setSource] = useSourceContext()
  const value = {
    textValue: source.citations[0].textValue,
    ranges: source.citations[0].ranges,
  }

  const updateSource = _value => {
    setSource({
      ...source,
      citations: [_value],
    })
  }

  // NOTE: setting `key` to the unique sourceId forces the component to remount
  // which is what we need because we're changing the initialState of the
  // underlying Editor component
  return (
    <TextControl key={source._id} value={value} rich onChange={updateSource} />
  )
})

const SourcesDemo = () => {
  const [sourceId, setSourceState] = useState(_id1)

  const [, setSource] = useSourceContext()

  const setSourceFields = sourceFields => {
    setSource(sourceFields)
  }

  const getSourceFields = id => {
    // don't need to call `getSource` here because `withSource` does that for us
    setSourceState(id)
  }

  return (
    <View>
      <EditFirstCitation sourceId={sourceId} />

      <Button onPress={() => getSourceFields(_id1)}>get source 1</Button>
      <Button onPress={() => getSourceFields(_id2)}>get source 2</Button>

      <Button onPress={() => setSourceFields(_seedValue1)}>set source 1</Button>

      <Button onPress={() => setSourceFields(_seedValue2)}>set source 2</Button>
    </View>
  )
}

const Box = ({ children }) => (
  <View borderVariant="thinDark" paddingVariant="tiny" width="100%">
    {children}
  </View>
)

const ProviderDecorator = storyFn => (
  <SourceProvider initialState={initialState} reducer={reducer}>
    {storyFn()}
  </SourceProvider>
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
