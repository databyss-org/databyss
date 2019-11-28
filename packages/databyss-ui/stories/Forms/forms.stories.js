import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import ObjectId from 'bson-objectid'
import ValueListProvider, {
  ValueListItem,
} from '@databyss-org/ui/components/ValueList/ValueListProvider'
import { View, TextControl, List, Grid } from '@databyss-org/ui/primitives'
import Section from './../Section'

import { ViewportDecorator } from '../decorators'

const _id = ObjectId().toHexString()

const source = {
  authors: [
    {
      firstName: {
        textValue: 'Maxim',
      },
      lastName: {
        textValue: 'Stamenov',
      },
    },
  ],
  text: {
    textValue: 'Stamenov, Language Structure',
    ranges: [
      {
        offset: 10,
        length: 18,
        marks: ['italic'],
      },
    ],
  },
  citations: [
    {
      textValue:
        'Stamenov, Maxim I., editor. Language Structure, Discourse and the Access to Consciousness. Vol. 12, John Benjamins Publishing Company, 1997. Crossref, doi:10.1075/aicr.12.',
      ranges: [],
    },
  ],
  _id,
}

const ControlList = ({ children, ...others }) => (
  <List horizontalItemPadding="small" {...others}>
    {children}
  </List>
)

const SourceForm = () => {
  const [values, setValues] = useState(source)

  return (
    <ValueListProvider onChange={setValues} values={values}>
      <Section title="Value List">
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
                  rich
                  gridFlexWrap="nowrap"
                  multiline
                  paddingVariant="tiny"
                />
              </ValueListItem>
            </ControlList>
          </View>
        </Grid>
      </Section>
    </ValueListProvider>
  )
}

storiesOf('Editor//Tests', module)
  .addDecorator(ViewportDecorator)
  .add('ValueList Controller', () => (
    <View>
      <SourceForm />
    </View>
  ))
