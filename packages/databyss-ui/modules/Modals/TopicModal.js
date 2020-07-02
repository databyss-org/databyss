import React, { useState } from 'react'
import { useTopicContext } from '@databyss-org/services/topics/TopicProvider'
import { TopicLoader } from '@databyss-org/ui/components/Loaders'
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

const TopicModal = ({ refId, visible, onUpdate, id }) => {
  const setTopic = useTopicContext(c => c.setTopic)
  const [values, setValues] = useState(null)
  const { hideModal } = useNavigationContext()

  const onBlur = () => {
    if (values) {
      setTopic(values)
    }
  }

  const onDismiss = () => {
    if (values) {
      // updates in topic provider
      setTopic(values)
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
      title="Edit Topic"
      dismissChild="done"
      disabled={values && !values.text.textValue.length}
    >
      <TopicLoader topicId={refId}>
        {topic => (
          <ValueListProvider onChange={setValues} values={values || topic}>
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
                </ControlList>
              </View>
            </Grid>
          </ValueListProvider>
        )}
      </TopicLoader>
    </ModalWindow>
  )
}

export default TopicModal
