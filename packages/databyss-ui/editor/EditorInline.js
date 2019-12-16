import React, { useState, useEffect } from 'react'
import { color } from 'styled-system'
import styled from '@emotion/styled'
import { View, Button, Icon } from '@databyss-org/ui/primitives'
import Close from '@databyss-org/ui/assets/angle-right-solid.svg'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import {
  showModal,
  hideModal,
} from '@databyss-org/ui/components/Navigation/NavigationProvider/actions'
import { updateSource } from './state/page/actions'
import { useEditorContext } from './EditorProvider'

const Styled = styled('span')(color)

const EditorInline = React.forwardRef(
  ({ backgroundColor, node, children, editor, ...others }, ref) => {
    const [refId, setRefId] = useState(null)

    const [editorState, dispatchEditor] = useEditorContext()
    const { blocks } = editorState

    const [, dispatchNav] = useNavigationContext()
    useEffect(
      () => {
        if (editor && !refId) {
          // sets initial refId
          const _id = editor.value.document.getClosestBlock(node.key).key
          const _refId = blocks[_id].refId
          setRefId(_refId)
        }
      },
      [node, editor]
    )

    const onUpdateSource = source => {
      // return a list of blocks containing the source that will be updated
      if (source) {
        const _idList = Object.keys(blocks).filter(
          block => blocks[block].refId === source._id
        )
        dispatchEditor(updateSource(source, _idList, { value: editor.value }))
      }
    }

    const onEditSource = () => {
      dispatchNav(
        showModal('SOURCE', {
          sourceId: refId,
          onUpdateSource,
        })
      )
      editor.blur()
    }

    return (
      <Styled {...others} ref={ref}>
        {children}

        {node.type === 'SOURCE' && (
          <View display="inline-block">
            <Button
              variant="editSource"
              onClick={onEditSource}
              data-test-atomic-edit="open"
            >
              <Icon sizeVariant="tiny" color="background.5">
                <Close />
              </Icon>
            </Button>
          </View>
        )}
      </Styled>
    )
  }
)

export default EditorInline
