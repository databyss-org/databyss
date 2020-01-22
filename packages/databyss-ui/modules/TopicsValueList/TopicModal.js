import React, { useState } from 'react'
import {
  useTopicContext,
  TopicLoader,
} from '@databyss-org/services/topics/TopicProvider'
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

// TODO: UPDATE TOPICS IN STATE/SLATE

const TopicModal = ({ topicId, visible, onUpdate, id }) => {
  const { setTopic } = useTopicContext()
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
    >
      <TopicLoader topicId={topicId}>
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
