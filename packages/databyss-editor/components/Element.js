import React, { useMemo, useEffect } from 'react'
import { Text, Button, Icon, View } from '@databyss-org/ui/primitives'
import PenSVG from '@databyss-org/ui/assets/pen.svg'
import { menuLauncherSize } from '@databyss-org/ui/theming/buttons'
import { ReactEditor, useEditor } from 'slate-react'
import { useEntryContext } from '@databyss-org/services/entries/EntryProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useEditorContext } from '../state/EditorProvider'
import BlockMenu from './BlockMenu'
import { isAtomicInlineType } from '../lib/util'
import { slateSelectionToStateSelection } from '../lib/slateUtils'
import { selectionHasRange } from '../state/util'
import { showAtomicModal } from '../lib/atomicModal'
import CitationsMenu from './CitationsMenu'

export const getAtomicStyle = type =>
  ({ SOURCE: 'bodyHeaderUnderline', TOPIC: 'bodyHeader' }[type])

const Element = ({ attributes, children, element }) => {
  const entryContext = useEntryContext()
  let searchTerm = ''

  if (entryContext) {
    searchTerm = entryContext.searchTerm
  }
  const editor = useEditor()
  const editorContext = useEditorContext()
  const navigationContext = useNavigationContext()

  const registerBlockRefByIndex = usePageContext(
    c => c && c.registerBlockRefByIndex
  )

  const onAtomicMouseDown = e => {
    e.preventDefault()
    showAtomicModal({ editorContext, navigationContext, editor })
  }

  const block = editorContext
    ? editorContext.state.blocks[ReactEditor.findPath(editor, element)[0]]
    : {}

  useEffect(
    () => () => {
      console.log('unmounting')
    },
    []
  )

  return useMemo(
    () => {
      // console.log(block)
      const blockMenuWidth = menuLauncherSize + 6
      const selHasRange = selectionHasRange(
        slateSelectionToStateSelection(editor)
      )

      return (
        <View
          ref={ref => {
            if (registerBlockRefByIndex) {
              const _index = ReactEditor.findPath(editor, element)[0]
              registerBlockRefByIndex(_index, ref)
            }
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
              contentEditable="false"
              readonly
              suppressContentEditableWarning
              left={blockMenuWidth * -1}
            >
              <BlockMenu element={element} />
            </View>
          )}

          {block.__showCitationMenu && <CitationsMenu element={element} />}

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
    // search term updates element for highlight
    [block, element, searchTerm]
  )
}

export default Element
