import React, { useState, useEffect } from 'react'
import { storiesOf } from '@storybook/react'
import ValueListProvider, {
  ValueListItem,
} from '@databyss-org/ui/components/ValueList/ValueListProvider'
import { View, List, Grid, TextControl } from '@databyss-org/ui/primitives'
import ObjectId from 'bson-objectid'

import SourceProvider, {
  useSourceContext,
  withSource,
} from '@databyss-org/services/sources/SourceProvider'

import reducer, { initialState } from '@databyss-org/services/sources/reducer'
import { ViewportDecorator } from '../decorators'

const _id = ObjectId().toHexString()

const _initialValue = {
  authors: [
    {
      firstName: {
        textValue: 'Max',
      },
      lastName: {
        textValue: 'Stamenov',
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
  _id,
}

const ControlList = ({ children, ...others }) => (
  <List horizontalItemPadding="small" {...others}>
    {children}
  </List>
)

const SourceForm = withSource(({ source }) => {
  const [values, setValues] = useState(source)
  const { setSource } = useSourceContext()

  const onChange = _value => {
    // update internal state
    setValues(_value)
    // update database
    setSource(_value)
  }

  return (
    <ValueListProvider onChange={onChange} values={values}>
      <Grid>
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
            <ValueListItem path="authors[0].firstName">
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
            </ValueListItem>
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
      </Grid>
    </ValueListProvider>
  )
})

const SourcesDemo = () => {
  const { setSource } = useSourceContext()

  // set initial value
  useEffect(() => {
    setSource(_initialValue)
  }, [])

  return (
    <View>
      <View paddingVariant="medium" mb="medium">
        <SourceForm sourceId={_id} />
      </View>
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
  .add('Update to DB', () => <SourcesDemo />)
