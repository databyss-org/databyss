import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import ValueListProvider, {
  ValueListItem,
} from '@databyss-org/ui/components/ValueList/ValueListProvider'
import { View, TextControl, List, Grid } from '@databyss-org/ui/primitives'
import Section from './../Section'
import { emptySource, populatedSource } from './__initialValues'
import { ViewportDecorator } from '../decorators'

const ControlList = ({ children, ...others }) => (
  <List horizontalItemPadding="small" {...others}>
    {children}
  </List>
)

const SourceForm = ({ initialSource }) => {
  const [values, setValues] = useState(initialSource)

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
        </Grid>
      </Section>
    </ValueListProvider>
  )
}

storiesOf('Cypress//Tests', module)
  .addDecorator(ViewportDecorator)
  .add('ValueList Controller', () => (
    <View>
      <SourceForm initialSource={emptySource} />
    </View>
  ))

storiesOf('Components//ValueList', module)
  .addDecorator(ViewportDecorator)
  .add('ValueList', () => (
    <View>
      <SourceForm initialSource={populatedSource} />
    </View>
  ))
