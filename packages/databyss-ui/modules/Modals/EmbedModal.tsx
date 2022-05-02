import React, { useState, useEffect } from 'react'
import { useIndexContext } from '@databyss-org/services'
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
import { Embed } from '@databyss-org/services/interfaces/Block'

const ControlList = ({ children, ...others }) => (
  <List horizontalItemPadding="small" {...others}>
    {children}
  </List>
)

const EmbedModal = ({ refId, visible, onUpdate, id }) => {
  const embedRes = useBlocks(BlockType.Embed, {
    includeIds: [refId],
  })
  const [values, setValues] = useState<null | Embed>(null)
  const { hideModal } = useNavigationContext()
  const { setEmbed } = useIndexContext()

  const onBlur = () => {
    if (values && values.text.textValue.length) {
      setEmbed(values)
    }
  }

  const onDismiss = () => {
    if (values && values.text.textValue.length) {
      // updates in topic provider
      setEmbed(values)
    }
    // hide modal in navProvider
    hideModal()
    // update to editor provider
    onUpdate(values)
  }

  const embed = embedRes.data?.[refId] as Embed

  useEffect(() => {
    if (!embed) {
      // still loading...
      return
    }
    setValues(embed)
  }, [embed])

  return (
    <ModalWindow
      visible={visible}
      key={id}
      widthVariant="form"
      onDismiss={onDismiss}
      title="Edit Topic"
      dismissChild="done"
      canDismiss={!!(values && values.text.textValue.length)}
    >
      {embedRes.isSuccess && values ? (
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
                  label="Title"
                  id="title"
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
        <LoadingFallback queryObserver={embedRes} />
      )}
    </ModalWindow>
  )
}

export default EmbedModal
