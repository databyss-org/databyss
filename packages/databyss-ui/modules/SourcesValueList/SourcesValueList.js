import React, { useState } from 'react'
import ValueListProvider, {
  ValueListItem,
} from '@databyss-org/ui/components/ValueList/ValueListProvider'
import { withSource } from '@databyss-org/services/sources/SourceProvider'
import { View, Grid, TextControl, List } from '@databyss-org/ui/primitives'

const ControlList = ({ children, ...others }) => (
  <List horizontalItemPadding="small" {...others}>
    {children}
  </List>
)

const SourcesValueList = ({ source, onValueChange }) => {
  const [values, setValues] = useState(source)

  const onChange = _value => {
    onValueChange(_value)
    setValues(_value)
  }

  return (
    <ValueListProvider onChange={onChange} values={values}>
      <Grid>
        <View
          paddingVariant="none"
          widthVariant="content"
          backgroundColor="background.0"
          width="100%"
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
    </ValueListProvider>
  )
}

export default withSource(SourcesValueList)
