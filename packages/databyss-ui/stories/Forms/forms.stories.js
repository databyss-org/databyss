import React, { useState, useEffect } from 'react'
import { storiesOf } from '@storybook/react'
import {
  useSourceContext,
  withSource,
} from '@databyss-org/services/sources/SourceProvider'
import { View, Button, Text, Grid } from '@databyss-org/ui/primitives'
import { ViewportDecorator } from '../decorators'

const SourceForm = ({ sourceId }) => {
  const [, setSource] = useSourceContext()

  const SourceValueList = withSource(({ source, children }) => (
    <ValueList onChange={setSource} values={source}>
      {children}
    </ValueList>
  ))

  return (
    <SourceProvider>
      <SourceValueList sourceId={sourceId}>
        <List horizontalItemPadding="small">
          <ValueListItem itemKey="text" default="untitled source">
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
