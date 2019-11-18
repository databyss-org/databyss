import React, { useState, useEffect } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Button, TextControl } from '@databyss-org/ui/primitives'
import ObjectId from 'bson-objectid'

import SourcesProvider, {
  useSourceContext,
  withSource,
} from '@databyss-org/services/sources/SourcesProvider'
// import ShowFirstCitation from '@databyss-org/services/sources/ShowFirstCitation'

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
  name: 'Stamenov. Language Structure',
  ranges: [{ offset: 0, length: 2, marks: 'bold' }],
  citations: [
    {
      textValue: 'Second Source',
      ranges: [],
    },
  ],
  _id: _id2,
}

const ShowFirstCitation = withSource(({ source }) => {
  const [value, setValue] = useState({
    textValue: source.citations[0].textValue,
    ranges: source.citations[0].ranges,
  })

  return <TextControl value={value} onChange={setValue} rich />
})

const SourcesDemo = () => {
  const [source, setSourceState] = useState(_id1)

  const [getSource, setSource] = useSourceContext()

  const setSourceFields = sourceFields => {
    setSource(sourceFields)
    setSourceState(sourceFields._id)
  }

  const getSourceFields = id => {
    getSource(id)
    setSourceState(id)
  }

  return (
    <View>
      <ShowFirstCitation sourceId={source} />

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
