import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Button, RichTextInput } from '@databyss-org/ui/primitives'

import SourceProvider, {
  useSourceContext,
  withSource,
} from '@databyss-org/services/sources/SourceProvider'

import reducer, { initialState } from '@databyss-org/services/sources/reducer'
import { ViewportDecorator } from '../decorators'
import { _seedValue1, _seedValue2, _id1, _id2 } from './__tests__/initialValue'

const EditFirstCitation = withSource(({ source }) => {
  const { setSource } = useSourceContext()

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
    <RichTextInput
      key={source._id}
      value={value}
      rich="true"
      onChange={updateSource}
      multiline
    />
  )
})

const SourcesDemo = () => {
  const [sourceId, setSourceState] = useState(_id1)

  const { setSource } = useSourceContext()

  const setSourceFields = sourceFields => {
    setSource(sourceFields)
  }

  const getSourceFields = id => {
    // don't need to call `getSource` here because `withSource` does that for us
    setSourceState(id)
  }

  return (
    <View>
      <View
        paddingVariant="medium"
        borderVariant="thinDark"
        minHeight="100"
        width="200"
        mb="medium"
        id="currentSource"
      >
        <EditFirstCitation sourceId={sourceId} mb="medium" />
      </View>
      <Button onPress={() => getSourceFields(_id1)}>get source 1</Button>
      <Button onPress={() => getSourceFields(_id2)}>get source 2</Button>
      <Button onPress={() => setSourceFields(_seedValue1)}>set source 1</Button>
      <Button onPress={() => setSourceFields(_seedValue2)}>set source 2</Button>
    </View>
  )
}

const ProviderDecorator = storyFn => (
  <SourceProvider initialState={initialState} reducer={reducer}>
    {storyFn()}
  </SourceProvider>
)

storiesOf('Services|Sources', module)
  .addDecorator(ProviderDecorator)
  .addDecorator(ViewportDecorator)
  .add('Load and Save sources', () => <SourcesDemo />)
