import React, { useState, useEffect } from 'react'
import { color, border, space } from 'styled-system'
import styled from '@emotion/styled'
import { Button, Icon } from '@databyss-org/ui/primitives'
import Pen from '@databyss-org/ui/assets/pen.svg'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { showModal } from '@databyss-org/ui/components/Navigation/NavigationProvider/actions'
import { updateSource } from './state/page/actions'
import { useEditorContext } from './EditorProvider'

const Span = styled('span')({ cursor: 'pointer' }, color, border, space)

const EditorInline = React.forwardRef(
  ({ isSelected, node, children, editor, ...others }, ref) => {
    const [refId, setRefId] = useState(null)

    const [editorState, dispatchEditor] = useEditorContext()
    const { blocks } = editorState
    const [, dispatchNav] = useNavigationContext()

    const backgroundColor = isSelected ? 'background.3' : 'background.2'

    useEffect(
      () => {
        if (editor && !refId) {
          // sets initial refId
          const _id = editor.value.document.getClosestBlock(node.key).key
          // get refId
          if (blocks[_id]) {
            const _refId = blocks[_id].refId
            setRefId(_refId)
          }
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
      <Span
        {...others}
        ref={ref}
        id="test"
        borderRadius={5}
        border="1px"
        p="2px"
        pl="4px"
        pr="4px"
        backgroundColor={backgroundColor}
      >
        {children}

        {node.type === 'SOURCE' &&
          isSelected && (
            <Span
              borderLeft="1px solid"
              borderColor="background.4"
              ml="10px"
              padding="1px"
            >
              <Button
                variant="editSource"
                onClick={onEditSource}
                data-test-atomic-edit="open"
              >
                <Icon sizeVariant="tiny" color="background.5">
                  <Pen />
                </Icon>
              </Button>
            </Span>
          )}
      </Span>
    )
  }
)

export default EditorInline
