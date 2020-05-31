import React, { useMemo } from 'react'
import { Text, Button, Icon, View } from '@databyss-org/ui/primitives'
import PenSVG from '@databyss-org/ui/assets/pen.svg'
import { editorMarginMenuItemHeight } from '@databyss-org/ui/theming/buttons'
import { ReactEditor, useEditor } from 'slate-react'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useEditorContext } from '../state/EditorProvider'
import BlockMenu from './BlockMenu'
import { isAtomicInlineType } from '../lib/util'
import { selectionHasRange } from '../state/util'
import { showAtomicModal } from '../lib/atomicModal'

export const getAtomicStyle = type =>
  ({ SOURCE: 'bodyHeaderUnderline', TOPIC: 'bodyHeader' }[type])

const Element = ({ attributes, children, element }) => {
  // const editor = useEditor()
  const editorContext = useEditorContext()
  // PERF: usePageContext and useNavigationContext are slow, even they do nothing.
  //   Maybe try useCallback and refs?
  // const navigationContext = useNavigationContext()
  // const pageContext = usePageContext()

  // const onAtomicMouseDown = e => {
  //   e.preventDefault()
  //   showAtomicModal({ editorContext, navigationContext, editor })
  // }

  const { index } = element
  const block = editorContext.state.blocks[index]

  const { selection } = editorContext.state
  const selHasRange =
    (selection.focus.index === index || selection.anchor.index === index) &&
    selectionHasRange(selection)

  return useMemo(
    () => {
      const blockMenuWidth = editorMarginMenuItemHeight + 6

      return (
        <View
          ref={ref => {
            // if (pageContext) {
            //   pageContext.registerBlockRefByIndex(index, ref)
            // }
          }}
          ml={element.isBlock ? blockMenuWidth : 0}
          pt="small"
          pb="small"
          display={element.isBlock ? 'flex' : 'inline-flex'}
          maxWidth="100%"
          position="relative"
          justifyContent="center"
        >
          {block.__showNewBlockMenu && (
            <View
              position="absolute"
              width="100%"
              contentEditable="false"
              readonly
              suppressContentEditableWarning
              left={blockMenuWidth * -1}
            >
              <BlockMenu element={element} />
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
              data-test-atomic-edit="open"
              pl="tiny"
              pr="0"
              ml="tinyNegative"
              backgroundColor={
                block.__isActive ? 'background.3' : 'transparent'
              }
              css={{
                cursor: selHasRange ? 'text' : 'pointer',
                caretColor: block.__isActive ? 'transparent' : 'currentcolor',
              }}
              {...(block.__isActive ? { onMouseDown: onAtomicMouseDown } : {})}
            >
              <Text variant={getAtomicStyle(element.type)} display="inline">
                {children}
              </Text>
              {block.__isActive && (
                <View display="inline">
                  <Button variant="editSource" onPress={onAtomicMouseDown}>
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
    },
    [block, element, selHasRange]
  )
}

export default Element
