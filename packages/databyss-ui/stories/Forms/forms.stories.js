import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import ObjectId from 'bson-objectid'

import ValueListProvider, {
  ValueListItem,
} from '@databyss-org/ui/components/ValueList/ValueListProvider'
import { View, TextControl, List, Grid } from '@databyss-org/ui/primitives'
import { ViewportDecorator } from '../decorators'

const _id = ObjectId().toHexString()

const source = {
  authors: [
    {
      firstName: 'Max',
      lastName: 'Stamenov',
    },
  ],
  name: 'Stamenov. Language Structure',
  ranges: [{ offset: 0, length: 2, marks: ['bold'] }],
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

const SourceForm = () => {
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
          widthVariant="content"
          backgroundColor="background.0"
        >
          <ControlList verticalItemPadding="tiny">
            <ValueListItem textPath="name" rangesPath="ranges">
              <TextControl
                labelProps={{
                  width: '25%',
                }}
                label="Citation"
                gridFlexWrap="nowrap"
                multiline
                rich
              />
            </ValueListItem>
            <ValueListItem textPath="authors[0].firstName">
              <TextControl
                labelProps={{
                  width: '25%',
                }}
                label="Author (First Name)"
                gridFlexWrap="nowrap"
              />
            </ValueListItem>
            <ValueListItem textPath="authors[0].lastName">
              <TextControl
                labelProps={{
                  width: '25%',
                }}
                label="Author (Last Name)"
                gridFlexWrap="nowrap"
              />
            </ValueListItem>
            <ValueListItem
              textPath="citations[0].textValue"
              rangesPath="citations[0].ranges"
            >
              <TextControl
                labelProps={{
                  width: '25%',
                }}
                label="Citation"
                rich
                gridFlexWrap="nowrap"
                multiline
              />
            </ValueListItem>
          </ControlList>
        </View>
      </Grid>
    </ValueListProvider>

    // <ValueListProvider onChange={setValues} values={values}>
    //   <List horizontalItemPadding="small" mb={20}>
    //     <ValueListItem textPath="name" rangesPath="ranges">
    //       <TextControl
    //         rich
    //         label="Name"
    //         placeholder="descriptive name for the source"
    //       />
    //     </ValueListItem>
    //     <ValueListItem textPath="authors[0].firstName">
    //       <TextControl label="Author (first name)" />
    //     </ValueListItem>
    //     <ValueListItem textPath="authors[0].lastName">
    //       <TextControl label="Author (last name)" />
    //     </ValueListItem>
    //     <ValueListItem
    //       textPath="citations[0].textValue"
    //       rangesPath="citations[0].ranges"
    //     >
    //       <TextControl label="Citation" rich />
    //     </ValueListItem>
    //   </List>
    //   <View
    //     id="formDocuments"
    //     borderVariant="thinDark"
    //     paddingVariant="none"
    //     width="100%"
    //     overflow="scroll"
    //     maxWidth="500px"
    //     flexShrink={1}
    //   >
    //     <pre>{JSON.stringify(values, null, 2)}</pre>
    //   </View>
    // </ValueListProvider>
  )
}

storiesOf('Value List', module)
  .addDecorator(ViewportDecorator)
  .add('ValueList Controller', () => (
    <View>
      <SourceForm />
    </View>
  ))
