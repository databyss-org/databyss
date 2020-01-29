import React from 'react'
import { color, border, space } from 'styled-system'
import styled from '@emotion/styled'
import { Button, Icon } from '@databyss-org/ui/primitives'
import PenSVG from '@databyss-org/ui/assets/pen.svg'

const Span = styled('span')({ cursor: 'pointer' }, color, border, space)

const EditorInline = React.forwardRef(
  ({ isSelected, node, children, editor, onEditSource, ...others }, ref) => {
    const backgroundColor = isSelected ? 'background.3' : ''

    const onClick = () => {
      if (node.type === 'SOURCE' && isSelected) {
        const _refId = editor.value.anchorBlock.data.get('refId')
        onEditSource(_refId, { value: editor.value })
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
        ml="-3px"
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
