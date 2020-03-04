import React, { useEffect, useState } from 'react'
import { RawHtml, Text, Button, Icon, View } from '@databyss-org/ui/primitives'
import PenSVG from '@databyss-org/ui/assets/pen.svg'
import fonts from '@databyss-org/ui/theming/fonts'
import styled from '@emotion/styled'
import { color, border, space, typography, layout } from 'styled-system'
import { Node, Range } from 'slate'
import { useSelected, ReactEditor, useEditor } from 'slate-react'
import BlockMenu from './BlockMenu'
import { isAtomicInlineType } from '../lib/util'

const Span = styled('span')(
  // { cursor: 'pointer' },
  color,
  border,
  space,
  typography,
  layout
)

export const getAtomicStyle = type =>
  ({ SOURCE: 'bodyHeaderUnderline', TOPIC: 'bodyHeader' }[type])

const Element = ({ attributes, children, element }) => {
  const editor = useEditor()
  const isSelected = useSelected()

  const onClick = () => {
    console.log('LAUNCH MODAL')
  }

  const [showNewBlockMenu, setShowNewBlockMenu] = useState(false)

  useEffect(
    () => {
      if (element.isBlock && editor.selection) {
        /*
        check to see if current block is empty
        */
        let _isEmptyAndActive = false
        if (Range.isCollapsed(editor.selection)) {
          const _path = editor.selection.anchor.path
          const _currentPath = ReactEditor.findPath(editor, element)
          if (_path[0] === _currentPath[0]) {
            _isEmptyAndActive = true
          }
        }

        const showButton =
          element.isBlock &&
          Node.string(element).length === 0 &&
          element.children.length === 1 &&
          _isEmptyAndActive
        if (showButton !== showNewBlockMenu) {
          setShowNewBlockMenu(showButton)
        }
      }
    },
    [editor.selection, element]
  )

  return (
    <Span pt="small" pb="small">
      {element.isBlock && (
        <View
          position="relative"
          width="100%"
          contentEditable="false"
          mt="extraSmall"
          display="inline-block"
          readonly
          mb="extraSmall"
          id="bug-test"
          height="0px"
          suppressContentEditableWarning
          left="-30px"
          top="small"
        >
          <BlockMenu element={element} showButton={showNewBlockMenu} />
        </View>
      )}
      {isAtomicInlineType(element.type) ? (
        <Span
          flexWrap="nowrap"
          display="inline"
          contentEditable="false"
          suppressContentEditableWarning
          css={{ userSelect: 'none', cursor: 'pointer' }}
          overflow="visible"
          borderRadius="5px"
          onMouseDown={onClick}
          fontSize={fonts.textVariants.bodyHeader.fontSize}
          pl="tiny"
          pr="0"
          pt="tiny"
          pb="tiny"
          mb="tiny"
          mt="small"
          ml="tinyNegative"
          backgroundColor={isSelected ? 'background.3' : ''}
        >
          <Text
            variant={getAtomicStyle(element.type)}
            display="inline"
            //  css={{ whiteSpace: 'nowrap' }}
            //   overflow="hidden"
          >
            <RawHtml _html={{ __html: element.character }} {...attributes} />
          </Text>
          {children}
          {isSelected && (
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
      ) : (
        <Text {...attributes}>{children}</Text>
      )}
    </Span>
  )
}

export default Element
