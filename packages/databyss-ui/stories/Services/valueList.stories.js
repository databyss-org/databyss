import React, { useState, useEffect } from 'react'
import { storiesOf } from '@storybook/react'
import ValueListProvider, {
  ValueListItem,
} from '@databyss-org/ui/components/ValueList/ValueListProvider'
import {
  View,
  Button,
  RichTextInput,
  List,
  Grid,
  TextControl,
} from '@databyss-org/ui/primitives'
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
      firstName: {
        textValue: '',
      },
      lastName: {
        textValue: '',
      },
    },
  ],
  text: {
    textValue: 'Stamenov. Language Structure',
    ranges: [{ offset: 0, length: 2, marks: 'bold' }],
  },
  citations: [
    {
      textValue:
        'Stamenov, Maxim I., editor. Language Structure, Discourse and the Access to Consciousness. Vol. 12, John Benjamins Publishing Company, 1997. Crossref, doi:10.1075/aicr.12.',
      ranges: [{ length: 10, offset: 0, marks: ['bold'] }],
    },
  ],
  _id: _id1,
}

const ValueList = withSource(({ source }) => {
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
    <RichTextInput
      key={source._id}
      value={value}
      rich
      onChange={updateSource}
      multiline
    />
  )
})

const SourcesDemo = () => {
  const [sourceId, setSourceState] = useState(_id1)

  useEffect(() => {
    setSource(_seedValue1)
  }, [])

  const [getSource, setSource] = useSourceContext()

  const setSourceFields = sourceFields => {
    setSource(sourceFields)
  }

  console.log(sourceId)

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
      >
        <SourceForm sourceId={sourceId} />
        {/* <ValueList sourceId={sourceId} mb="medium" /> */}
      </View>
      <Button onPress={() => getSourceFields(_id1)}>get source 1</Button>
      <Button onPress={() => getSourceFields(_id2)}>get source 2</Button>
      <Button onPress={() => setSourceFields(_seedValue1)}>set source 1</Button>
      <Button onPress={() => setSourceFields(_seedValue2)}>set source 2</Button>
    </View>
  )
}

const ControlList = ({ children, ...others }) => (
  <List horizontalItemPadding="small" {...others}>
    {children}
  </List>
)

const SourceForm = withSource(({ source }) => {
  console.log(source)
  const [values, setValues] = useState(source)

  return (
    <ValueListProvider onChange={setValues} values={values}>
      <Grid>
        <View
          id="formDocuments"
          borderVariant="thinDark"
          paddingVariant="none"
          overflow="scroll"
          maxWidth="500px"
          flexShrink={1}
        >
          <pre>{JSON.stringify(values, null, 2)}</pre>
        </View>
        <View
          borderVariant="thinLight"
          paddingVariant="none"
          widthVariant="content"
          backgroundColor="background.0"
        >
          <ControlList verticalItemPadding="tiny">
            <ValueListItem path="text">
              <TextControl
                labelProps={{
                  width: '25%',
                }}
                label="Name"
                id="name"
                gridFlexWrap="nowrap"
                paddingVariant="tiny"
                rich
              />
            </ValueListItem>
            {/* <ValueListItem path="authors[0].firstName">
              <TextControl
                labelProps={{
                  width: '25%',
                }}
                label="Author (First Name)"
                id="firstName"
                gridFlexWrap="nowrap"
                paddingVariant="tiny"
              />
            </ValueListItem>
            <ValueListItem path="authors[0].lastName">
              <TextControl
                labelProps={{
                  width: '25%',
                }}
                label="Author (Last Name)"
                id="lastName"
                gridFlexWrap="nowrap"
                paddingVariant="tiny"
              />
            </ValueListItem> */}
            <ValueListItem path="citations[0]">
              <TextControl
                labelProps={{
                  width: '25%',
                }}
                label="Citation"
                id="citation"
                rich
                gridFlexWrap="nowrap"
                multiline
                paddingVariant="tiny"
              />
            </ValueListItem>
          </ControlList>
        </View>
      </Grid>
    </ValueListProvider>
  )
})

const ProviderDecorator = storyFn => (
  <SourceProvider initialState={initialState} reducer={reducer}>
    {storyFn()}
  </SourceProvider>
)

storiesOf('Services|ValueList', module)
  .addDecorator(ProviderDecorator)
  .addDecorator(ViewportDecorator)
  .add('Load and Save sources', () => <SourcesDemo />)
