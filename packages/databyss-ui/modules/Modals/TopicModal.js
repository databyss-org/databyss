import React, { useState, useEffect } from 'react'
import { setTopic } from '@databyss-org/services/topics'
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

  const topic = topicsRes.data?.[refId]

  useEffect(() => {
    if (!topic) {
      // still loading...
      return
    }
    setValues(topic)
  }, [topic])

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
      {topicsRes.isSuccess && values ? (
        <ValueListProvider onChange={setValues} values={values}>
          <View
            paddingVariant="none"
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
        </ValueListProvider>
      ) : (
        <LoadingFallback queryObserver={topicsRes} />
      )}
    </ModalWindow>
  )
}

export default TopicModal
