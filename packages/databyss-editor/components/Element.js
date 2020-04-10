import React, { useEffect, useState } from 'react'
import { RawHtml, Text, Button, Icon, View } from '@databyss-org/ui/primitives'
import PenSVG from '@databyss-org/ui/assets/pen.svg'
import { editorMarginMenuItemHeight } from '@databyss-org/ui/theming/buttons'
import { Node, Range } from 'slate'
import { useSelected, ReactEditor, useEditor } from 'slate-react'
import BlockMenu from './BlockMenu'
import { isAtomicInlineType } from '../lib/util'

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

  const blockMenuWidth = editorMarginMenuItemHeight + 6

  return (
    <View
      ml={element.isBlock ? blockMenuWidth : 0}
      pt="small"
      pb="small"
      display={element.isBlock ? 'flex' : 'inline-flex'}
      maxWidth="100%"
      position="relative"
      justifyContent="center"
    >
      {element.isBlock && (
        <View
          position="absolute"
          width="100%"
          contentEditable="false"
          readonly
          suppressContentEditableWarning
          left={blockMenuWidth * -1}
        >
          <BlockMenu element={element} showButton={showNewBlockMenu} />
        </View>
      )}
      {isAtomicInlineType(element.type) ? (
        <View
          flexWrap="nowrap"
          display="inline-flex"
          flexDirection="row"
          alignItems="center"
          borderRadius="default"
          overflow="hidden"
          borderRadiusVariant="default"
          onMouseDown={onClick}
          pl="tiny"
          pr="0"
          ml="tinyNegative"
        >
          <Text
            variant={getAtomicStyle(element.type)}
            css={{ whiteSpace: 'nowrap' }}
            overflow="hidden"
          >
            {children}
          </Text>
        </View>
      ) : (
        <Text {...attributes}>{children}</Text>
      )}
    </View>
  )
}

export default Element
