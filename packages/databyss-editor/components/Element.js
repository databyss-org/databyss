import React, { useEffect, useState } from 'react'
import { Text, Button, Icon, View } from '@databyss-org/ui/primitives'
import PenSVG from '@databyss-org/ui/assets/pen.svg'
import { editorMarginMenuItemHeight } from '@databyss-org/ui/theming/buttons'
import { Node, Range } from 'slate'
import { ReactEditor, useEditor } from 'slate-react'
import BlockMenu from './BlockMenu'
import { isAtomicInlineType } from '../lib/util'
import { slateSelectionToStateSelection } from '../lib/slateUtils'
import { selectionHasRange } from '../state/util'

export const getAtomicStyle = type =>
  ({ SOURCE: 'bodyHeaderUnderline', TOPIC: 'bodyHeader' }[type])

const Element = ({ attributes, children, element }) => {
  const editor = useEditor()

  const onAtomicMouseDown = e => {
    if (element.isActive) {
      e.preventDefault()
    }
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

  const onPressEditAtomic = e => {
    console.log('button')
    e.stopPropagation()
  }

  const blockMenuWidth = editorMarginMenuItemHeight + 6

  const _selHasRange = selectionHasRange(slateSelectionToStateSelection(editor))

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
      {element.isBlock &&
        !_selHasRange && (
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
          alignSelf="flex-start"
          flexWrap="nowrap"
          display="inline"
          alignItems="center"
          borderRadius="default"
          borderRadiusVariant="default"
          onMouseDown={onAtomicMouseDown}
          pl="tiny"
          pr="0"
          ml="tinyNegative"
          backgroundColor={element.isActive ? 'background.3' : 'transparent'}
          css={{
            cursor: _selHasRange ? 'text' : 'pointer',
            caretColor: element.isActive ? 'transparent' : 'currentcolor',
          }}
        >
          <Text variant={getAtomicStyle(element.type)} display="inline">
            {children}
          </Text>
          {element.isActive && (
            <View display="inline">
              <Button
                variant="editSource"
                data-test-atomic-edit="open"
                onPress={onPressEditAtomic}
                css={{ zIndex: 1000 }}
              >
                <Icon sizeVariant="tiny" color="background.5">
                  <PenSVG />
                </Icon>
              </Button>
            </View>
          )}
        </View>
      ) : (
        <Text {...attributes}>{children}</Text>
      )}
    </View>
  )
}

export default Element
