import React, { useState, useEffect } from 'react'
import { color } from 'styled-system'
import styled from '@emotion/styled'
import {
  View,
  Button,
  Text,
  Grid,
  Icon,
  ModalWindow,
  TextControl,
  List,
} from '@databyss-org/ui/primitives'
import buttons from '@databyss-org/ui/theming/buttons'
import Close from '@databyss-org/ui/assets/angle-right-solid.svg'
import { updateSource } from './state/page/actions'
import { useEditorContext } from './EditorProvider'
import {
  useSourceContext,
  withSource,
} from '@databyss-org/services/sources/SourceProvider'
import ValueListProvider, {
  ValueListItem,
} from '@databyss-org/ui/components/ValueList/ValueListProvider'

const Styled = styled('span')(color)

const { buttonVariants } = buttons

const modal = {
  title: 'Edit Source',
  dismissChild: 'Save',
  secondaryChild: 'Cancel',
}

const ControlList = ({ children, ...others }) => (
  <List horizontalItemPadding="small" {...others}>
    {children}
  </List>
)

const SourceModal = withSource(
  ({ source, visible, setVisible, updateSource, ...modal }) => {
    const [values, setValues] = useState(source)
    const [, setSource] = useSourceContext()

    const onChange = _value => {
      // update internal state
      setValues(_value)
    }

    const onSave = () => {
      setVisible(false)
      setSource(values)
      updateSource(values)
      // set internal dispatch here
    }

    return (
      <ModalWindow visible={visible} onDismiss={() => onSave()} {...modal}>
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
)

const EditorInline = React.forwardRef(
  ({ backgroundColor, node, children, ...others }, ref) => {
    const [visible, setVisible] = useState(false)
    const [refId, setRefId] = useState(null)

    const [editorState, dispatchEditor] = useEditorContext()
    const { editableState, blocks } = editorState

    useEffect(
      () => {
        if (editableState && !refId) {
          // sets initial refId
          const _id = editableState.value.document.getClosestBlock(node.key).key
          const _refId = blocks[_id].refId
          setRefId(_refId)
        }
      },
      [node, editableState]
    )

    const onUpdateSource = source => {
      dispatchEditor(updateSource(source, { value: editableState.value }))
    }

    return (
      <Styled {...others} ref={ref}>
        {children}
        <View display="inline-block">
          <Button
            backgroundColor={backgroundColor}
            onClick={() => setVisible(true)}
            data-test-atomic-edit="open"
          >
            <Icon
              sizeVariant="tiny"
              color={buttonVariants.editorMarginMenu.color}
            >
              <Close />
            </Icon>
          </Button>
        </View>
        <View>
          {refId && (
            <SourceModal
              sourceId={refId}
              visible={visible}
              setVisible={setVisible}
              updateSource={onUpdateSource}
              {...modal}
            />
          )}
        </View>
      </Styled>
    )
  }
)

export default EditorInline
