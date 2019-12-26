import React, { useState, useEffect } from 'react'
import ValueListProvider, {
  ValueListItem,
} from '@databyss-org/ui/components/ValueList/ValueListProvider'
import { withSource } from '@databyss-org/services/sources/SourceProvider'
import { View, Grid, TextControl, List } from '@databyss-org/ui/primitives'
import _ from 'lodash'

const ControlList = ({ children, ...others }) => (
  <List horizontalItemPadding="small" {...others}>
    {children}
  </List>
)

const SourcesValueList = ({ source, onValueChange, onValueBlur }) => {
  const [values, setValues] = useState(source)

  // useEffect(() => {
  //   console.log('mounted')
  //   onValueChange(source)

  //   //  console.log(source)
  // }, [])

  const onChange = _value => {
    onValueChange(_value)
    setValues(_value)
    // if (!_.isEqual(_value, values) && values) {
    //   onValueChange(_value)
    // }
  }

  const onBlur = () => {
    onValueBlur()
    // if (!_.isEqual(source, values) && values) {
    //    onValueChange(values)
    // }
  }

  console.log('values', values)
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
            <ValueListItem path="citations[0]">
              <TextControl
                labelProps={{
                  width: '25%',
                }}
                label="citations"
                id="citations"
                gridFlexWrap="nowrap"
                paddingVariant="tiny"
                onBlur={onBlur}
              />
            </ValueListItem>
            <ValueListItem path="text">
              <TextControl
                labelProps={{
                  width: '25%',
                }}
                label="Name"
                id="name"
                rich
                focusOnMount
                gridFlexWrap="nowrap"
                paddingVariant="tiny"
                onBlur={onBlur}
              />
            </ValueListItem>
          </ControlList>
        </View>
      </Grid>
    </ValueListProvider>
  )
}

export default withSource(SourcesValueList)
