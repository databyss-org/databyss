import React from 'react'
import { color, border, space } from 'styled-system'
import styled from '@emotion/styled'
import { Button, Icon } from '@databyss-org/ui/primitives'
import PenSVG from '@databyss-org/ui/assets/pen.svg'
import { isAtomicInlineType } from '@databyss-org/ui/editor/slate/page/reducer'

const Span = styled('span')({ cursor: 'pointer' }, color, border, space)

const EditorInline = React.forwardRef(
  ({ isSelected, node, children, editor, onEdit, ...others }, ref) => {
    const backgroundColor = isSelected ? 'background.3' : ''
    const onClick = () => {
      if (isAtomicInlineType(node.type) && isSelected) {
        const refId = editor.value.anchorBlock.data.get('refId')
        onEdit(refId, node.type, { value: editor.value })
      }
    }

    return (
      <Span
        {...others}
        onMouseDown={onClick}
        ref={ref}
        borderRadius={5}
        p="tiny"
        pr="0"
        ml="tinyNegative"
        backgroundColor={backgroundColor}
      >
        {children}

        {isAtomicInlineType(node.type) &&
          isSelected && (
            <Span
              borderLeft="1px solid"
              borderColor="background.4"
              ml="10px"
              padding="1px"
            >
              <Button variant="editSource" data-test-atomic-edit="open">
                <Icon sizeVariant="tiny" color="background.5">
                  <PenSVG />
                </Icon>
              </Button>
            </Span>
          )}
      </Span>
    )
  }
)

export default EditorInline
