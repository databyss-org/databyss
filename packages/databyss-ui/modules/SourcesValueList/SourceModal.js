import React, { useState } from 'react'
import {
  useSourceContext,
  withSource,
} from '@databyss-org/services/sources/SourceProvider'
import ValueListProvider, {
  ValueListItem,
} from '@databyss-org/ui/components/ValueList/ValueListProvider'
import {
  View,
  Grid,
  ModalWindow,
  TextControl,
  List,
} from '@databyss-org/ui/primitives'

const ControlList = ({ children, ...others }) => (
  <List horizontalItemPadding="small" {...others}>
    {children}
  </List>
)

const SourceModal = ({ source, visible, setVisible, onUpdateSource }) => {
  const [values, setValues] = useState(source)
  const [, setSource] = useSourceContext()

  const onChange = _value => {
    // update internal state
    setValues(_value)
  }

  const onSave = () => {
    setVisible(false)
    setSource(values)
    onUpdateSource(values)
  }

  return (
    <ModalWindow
      visible={visible}
      onDismiss={() => onSave()}
      title="Edit Source"
      dismissChild="Save"
      secondaryChild="Cancel"
    >
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
    </ModalWindow>
  )
}

export default withSource(SourceModal)
