import React, { useEffect, useState, useRef } from 'react'
import { Text, Button, Icon, View } from '@databyss-org/ui/primitives'
import PenSVG from '@databyss-org/ui/assets/pen.svg'
import { editorMarginMenuItemHeight } from '@databyss-org/ui/theming/buttons'
import { Node, Range, Transforms } from 'slate'
import { ReactEditor, useEditor } from 'slate-react'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useEditorContext } from '../state/EditorProvider'

import BlockMenu from './BlockMenu'
import { isAtomicInlineType } from '../lib/util'
import {
  slateSelectionToStateSelection,
  stateSelectionToSlateSelection,
} from '../lib/slateUtils'
import {
  selectionHasRange,
  entityForBlockIndex,
  getEntityAtIndex,
} from '../state/util'

export const getAtomicStyle = type =>
  ({ SOURCE: 'bodyHeaderUnderline', TOPIC: 'bodyHeader' }[type])

const Element = ({ attributes, children, element }) => {
  const editor = useEditor()
  const editorContext = useEditorContext()
  const navigationContext = useNavigationContext()
  const elementRef = useRef(null)
  const [focusPending, setFocusPending] = useState(false)

  useEffect(
    () => () => {
      setTimeout(() => {
        //   if (focusPending) {
        //     const index = editorContext.state.selection.anchor.index
        //     const offset = Node.string(editor.children[index]).length
        //     const _sel = {
        //       anchor: { index, offset },
        //       focus: { index, offset },
        //     }
        //     const _slateSelection = stateSelectionToSlateSelection(
        //       editor.children,
        //       _sel
        //     )
        //     Transforms.setSelection(editor, _slateSelection)
        //   }
      }, 200)
    },
    [focusPending]
  )

  // console.log(focusPending)

  // useEffect(
  //   () => {
  //     console.log('HOOK', focusPending)
  //     if (focusPending) {
  //       const _text = Node.string(element)
  //       const _currentPath = ReactEditor.findPath(editor, element)
  //       console.log(_text)
  //       console.log(_currentPath[0])
  //     }

  //     // const entity = getEntityAtIndex(editorContext.state, _currentPath[0])
  //     //    console.log(entity)
  //     //  console.log(element)
  //   },
  //   [element]
  // )

  const onAtomicMouseDown = e => {
    if (element.isActive) {
      e.preventDefault()

      if (navigationContext) {
        const index = editorContext.state.selection.anchor.index
        const _entity = entityForBlockIndex(editorContext.state, index)
        const refId = _entity._id
        const type = _entity.type
        const { setContent, setSelection, state } = editorContext
        const { showModal } = navigationContext
        setFocusPending(true)

        const onUpdate = atomic => {
          if (atomic) {
            const selection = state.selection
            setContent({
              selection,
              //  restoreSelection: true,
              operations: [
                {
                  //  selection,
                  index,
                  isRefEntity: true,
                  text: atomic.text,
                },
              ],
            })

            setTimeout(() => {
              //  console.log('before', editor.selection)
              //  ReactEditor.focus(editor)

              //  console.log('after', editor.selection)

              const _offset = atomic.text.textValue.length

              const _sel = {
                anchor: { index, offset: _offset },
                focus: { index, offset: _offset },
              }

              const _slateSelection = stateSelectionToSlateSelection(
                editor.children,
                _sel
              )
              Transforms.select(editor, _slateSelection)
              ReactEditor.focus(editor)
            }, 10)

            // setTimeout(() => {
            //   console.log(elementRef.current)
            //   const _currentPath = ReactEditor.findPath(editor, element)

            //   console.log(_currentPath)
            //   const _node = Node.get(editor, _currentPath)
            //   //  console.log(Node.get(editor, _currentPath))
            //   console.log(_node)
            //   console.log(ReactEditor.toDOMNode(editor, element))
            // }, 500)
            // console.log(ReactEditor.isFocused(editor))
            //  ReactEditor.focus(editor)

            // console.log(ReactEditor.toDOMNode(editor, element))

            // setTimeout(() => {
            //   console.log('in timeout')

            //   const _offset = atomic.text.textValue.length

            //   const _sel = {
            //     anchor: { index, offset: _offset },
            //     focus: { index, offset: _offset },
            //   }

            //   const _slateSelection = stateSelectionToSlateSelection(
            //     editor.children,
            //     _sel
            //   )
            //   Transforms.setSelection(editor, _slateSelection)
            //   //  ReactEditor.focus(editor)
            // }, 10000)
          } else {
            setFocusPending(false)
          }
        }

        // const _currentPath = ReactEditor.findPath(editor, element)

        // console.log(_currentPath)
        // const _node = Node.get(editor, _currentPath)
        // //  console.log(Node.get(editor, _currentPath))
        // console.log(_node)
        // console.log(ReactEditor.toDOMNode(editor, element))

        // dispatch navigation modal
        showModal({
          component: type,
          props: {
            onUpdate,
            refId,
          },
        })
      }
    }
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

  const _selHasRange = selectionHasRange(slateSelectionToStateSelection(editor))

  // console.log(element)

  return (
    <View
      ref={elementRef}
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
          data-test-atomic-edit="open"
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
              <Button variant="editSource" css={{ zIndex: 1000 }}>
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
