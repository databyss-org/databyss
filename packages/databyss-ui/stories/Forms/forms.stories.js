import React, { useState, useEffect } from 'react'
import { storiesOf } from '@storybook/react'
import SourceProvider, {
  useSourceContext,
  withSource,
} from '@databyss-org/services/sources/SourceProvider'
import ValueListProvider, {
  useValueListContext,
  ValueListItem,
} from '@databyss-org/services/forms/FormProvider'
import { View, Text, TextControl } from '@databyss-org/ui/primitives'
import { ViewportDecorator } from '../decorators'

// insert into UI folder components/ValueList/
//
const SourceForm = ({ sourceId }) => {
  const [, setSource] = useSourceContext()

  // dont use source provider
  // move value list item

  // show JSON values
  // textValue and ranges
  const SourceValueList = withSource(({ source, children }) => (
    <ValueListProvider onChange={setSource} values={source}>
      {children}
    </ValueListProvider>
  ))
  return (
    <SourceProvider>
      <SourceValueList sourceId={sourceId}>
        <List horizontalItemPadding="small">
          <ValueListItem path="text">
            <TextControl
              label="Name"
              rich
              placeholder="descriptive name for the source"
            />
          </ValueListItem>
          <ValueListItem path="authors[0].firstName">
            <TextControl label="Author (first name)" />
          </ValueListItem>
          <ValueListItem path="authors[0].lastName">
            <TextControl label="Author (last name)" />
          </ValueListItem>
          <ValueListItem path="citations[0].text">
            <TextControl label="Citation" rich />
          </ValueListItem>
        </List>
      </SourceValueList>
    </SourceProvider>
  )
}

storiesOf('Forms', module)
  .addDecorator(ViewportDecorator)
  .add('Form Controller', () => (
    <View>
      <Text>HERE</Text>
    </View>
  ))
