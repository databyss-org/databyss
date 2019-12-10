import React, { useState, useEffect } from 'react'
import { color } from 'styled-system'
import styled from '@emotion/styled'
import { View, Button, Icon } from '@databyss-org/ui/primitives'
import buttons from '@databyss-org/ui/theming/buttons'
import Close from '@databyss-org/ui/assets/angle-right-solid.svg'
import { updateSource } from './state/page/actions'
import { useEditorContext } from './EditorProvider'
import SourceModal from '@databyss-org/ui/modules/SourcesValueList/SourceModal'

const Styled = styled('span')(color)

const { buttonVariants } = buttons

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
      // return a list of blocks containing the source that will be updated
      const _idList = Object.keys(blocks).filter(
        (block, i) => blocks[block].refId === source._id
      )
      dispatchEditor(
        updateSource(source, _idList, { value: editableState.value })
      )
    }

    return (
      <Styled {...others} ref={ref}>
        {children}
        <View display="inline-block">
          <Button
            variant="editSource"
            onClick={() => setVisible(true)}
            data-test-atomic-edit="open"
          >
            <Icon sizeVariant="tiny" color="background.5">
              <Close />
            </Icon>
          </Button>
        </View>
        {refId && (
          <SourceModal
            sourceId={refId}
            visible={visible}
            setVisible={setVisible}
            onUpdateSource={onUpdateSource}
          />
        )}
      </Styled>
    )
  }
)

export default EditorInline
