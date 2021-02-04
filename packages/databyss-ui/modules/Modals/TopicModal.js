import React, { useState } from 'react'
import { useTopicContext } from '@databyss-org/services/topics/TopicProvider'
import ValueListProvider, {
  ValueListItem,
} from '@databyss-org/ui/components/ValueList/ValueListProvider'
import {
  ModalWindow,
  View,
  TextControl,
  List,
} from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useBlocks } from '@databyss-org/data/pouchdb/hooks'
import { BlockType } from '@databyss-org/editor/interfaces'
import { LoadingFallback } from '@databyss-org/ui/components'

const ControlList = ({ children, ...others }) => (
  <List horizontalItemPadding="small" {...others}>
    {children}
  </List>
)

const TopicModal = ({ refId, visible, onUpdate, id }) => {
  const topicsRes = useBlocks(BlockType.Topic, {
    includeIds: [refId],
  })
  const setTopic = useTopicContext((c) => c.setTopic)
  const [values, setValues] = useState(null)
  const { hideModal } = useNavigationContext()

  const onBlur = () => {
    if (values && values.text.textValue.length) {
      setTopic(values)
    }
  }

  const onDismiss = () => {
    if (values && values.text.textValue.length) {
      // updates in topic provider
      setTopic(values)
    }
    // hide modal in navProvider
    hideModal()
    // update to editor provider
    onUpdate(values)
  }

  if (!topicsRes.isSuccess) {
    return <LoadingFallback queryObserver={topicsRes} />
  }

  const topic = topicsRes.data[refId]

  if (!values) {
    setValues(topic)
  }

  return (
    <ModalWindow
      visible={visible}
      key={id}
      widthVariant="form"
      onDismiss={onDismiss}
      title="Edit Topic"
      dismissChild="done"
      canDismiss={values && values.text.textValue.length}
    >
      <ValueListProvider onChange={setValues} values={values || topic}>
        <View paddingVariant="none" backgroundColor="background.0" width="100%">
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
      </ValueListProvider>
    </ModalWindow>
  )
}

export default TopicModal
