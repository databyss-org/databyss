import React, { useState } from 'react'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { SourceLoader } from '@databyss-org/ui/components/Loaders'
import ValueListProvider, {
  ValueListItem,
} from '@databyss-org/ui/components/ValueList/ValueListProvider'
import {
  ModalWindow,
  View,
  Grid,
  TextControl,
  List,
} from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'

const ControlList = ({ children, ...others }) => (
  <List horizontalItemPadding="small" {...others}>
    {children}
  </List>
)

const SourceModal = ({ refId, visible, onUpdate, id }) => {
  const { setSource } = useSourceContext()
  const [values, setValues] = useState(null)
  const { hideModal } = useNavigationContext()

  const onBlur = () => {
    if (values && values.text.textValue.length) {
      setSource(values)
    }
  }

  const onDismiss = () => {
    if (values && values.text.textValue.length) {
      // updates in source provider
      setSource(values)
    }
    // hide modal in navProvider
    hideModal()
    // update to editor provider
    onUpdate(values)
  }

  return (
    <ModalWindow
      visible={visible}
      key={id}
      widthVariant="form"
      onDismiss={onDismiss}
      title="Edit Source"
      dismissChild="done"
      canDismiss={values && values.text.textValue.length}
    >
      <SourceLoader sourceId={refId}>
        {source => {
          if (!values) {
            setValues(source)
          }
          return (
            <ValueListProvider onChange={setValues} values={values || source}>
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
                        focusOnMount
                        paddingVariant="tiny"
                        rich
                        onBlur={onBlur}
                      />
                    </ValueListItem>
                    <ValueListItem path="detail.citations[0]">
                      <TextControl
                        labelProps={{
                          width: '25%',
                        }}
                        label="Citation"
                        id="citation"
                        rich
                        gridFlexWrap="nowrap"
                        paddingVariant="tiny"
                        onBlur={onBlur}
                      />
                    </ValueListItem>
                    <ValueListItem path="detail.authors[0].firstName">
                      <TextControl
                        labelProps={{
                          width: '25%',
                        }}
                        label="Author (First Name)"
                        id="firstName"
                        gridFlexWrap="nowrap"
                        paddingVariant="tiny"
                        onBlur={onBlur}
                      />
                    </ValueListItem>
                    <ValueListItem path="detail.authors[0].lastName">
                      <TextControl
                        labelProps={{
                          width: '25%',
                        }}
                        label="Author (Last Name)"
                        id="lastName"
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
        }}
      </SourceLoader>
    </ModalWindow>
  )
}

export default SourceModal
