import React, { useMemo, useState, useEffect, useRef } from 'react'
import { Text, Button, Icon, View } from '@databyss-org/ui/primitives'
import { isMobile } from '@databyss-org/ui/lib/mediaQuery'
import PenSVG from '@databyss-org/ui/assets/pen.svg'
import { menuLauncherSize } from '@databyss-org/ui/theming/buttons'
import { ReactEditor, useEditor } from '@databyss-org/slate-react'
import { Range } from '@databyss-org/slate'
import { useEntryContext } from '@databyss-org/services/entries/EntryProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useEditorPageContext } from '@databyss-org/services'
import { useEditorContext } from '../state/EditorProvider'
import BlockMenu from './BlockMenu'
import { isAtomicInlineType } from '../lib/util'
import { showAtomicModal } from '../lib/atomicModal'
import { SuggestMenu, SuggestSources, SuggestTopics } from './Suggest'

// browser still takes some time to process the spellcheck
const SPELLCHECK_DEBOUNCE_TIME = 300

export const getAtomicStyle = (type) =>
  ({
    SOURCE: 'bodyHeading3Underline',
    TOPIC: 'bodyHeading2',
    END_TOPIC: 'uiTextSmall',
    END_SOURCE: 'uiTextSmall',
  }[type])

export const isAtomicClosure = (type) =>
  ({
    END_TOPIC: true,
    END_SOURCE: true,
  }[type])

const Element = ({ attributes, children, element, readOnly }) => {
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)
  const _isPublic = isPublicAccount ? isPublicAccount() : null

  const _searchTerm = useEntryContext((c) => c && c.searchTerm)

  let searchTerm = ''

  if (_searchTerm) {
    searchTerm = _searchTerm
  }
  const editor = useEditor()

  const editorContext = useEditorContext()

  const navigationContext = useNavigationContext()

  const registerBlockRefByIndex = useEditorPageContext(
    (c) => c && c.registerBlockRefByIndex
  )

  const onAtomicMouseDown = (e) => {
    e.preventDefault()
    showAtomicModal({ editorContext, navigationContext, editor })
  }

  const blockIndex = ReactEditor.findPath(editor, element)[0]
  const block = editorContext ? editorContext.state.blocks[blockIndex] : {}
  const previousBlock = editorContext
    ? editorContext.state.blocks[blockIndex - 1]
    : {}

  // spellcheck is debounced on element change
  // state is used to trigger a re-render
  const [spellCheck, setSpellCheck] = useState(true)
  // ref is used to keep current in `setTimeout`
  const spellCheckRef = useRef(true)
  const spellCheckTimeoutRef = useRef()

  const onSuggestions = (blocks) => {
    if (!editorContext) {
      return
    }
    editorContext.cacheEntitySuggestions(blocks)
  }

  useEffect(() => {
    if (spellCheckTimeoutRef.current) {
      spellCheckRef.current = false
      setSpellCheck(false)
      clearTimeout(spellCheckTimeoutRef.current)
    }

    spellCheckTimeoutRef.current = setTimeout(() => {
      if (!spellCheckRef.current) {
        spellCheckRef.current = true
        setSpellCheck(true)
      }
    }, SPELLCHECK_DEBOUNCE_TIME)
  }, [element])

  return useMemo(
    () => {
      if (!block) {
        return null
      }

      const blockMenuWidth = menuLauncherSize + 6

      const selHasRange = !Range.isCollapsed(editor.selection)

      const vpad =
        block.type === 'ENTRY' || block.type === previousBlock?.type ? 1 : 3

      return (
        <View
          ref={(ref) => {
            if (registerBlockRefByIndex) {
              const _index = ReactEditor.findPath(editor, element)[0]
              registerBlockRefByIndex(_index, ref)
            }
          }}
          ml={element.isBlock && !(readOnly && isMobile()) ? 'medium' : 0}
          mr="large"
          pt={vpad}
          pb="em"
          display={element.isBlock ? 'flex' : 'inline-flex'}
          spellCheck={spellCheck}
          widthVariant="content"
          position="relative"
          justifyContent="center"
          {...(isAtomicClosure(previousBlock?.type) && {
            pt: '4',
          })}
          {...(isAtomicClosure(element.type) && {
            borderBottomWidth: '2px',
            borderBottomColor: 'gray.5',
            pb: 'small',
            mr: 'largest',
          })}
        >
          {block.__showNewBlockMenu && !readOnly && !_isPublic && (
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

          {block.__showCitationMenu && (
            <View contentEditable="false" suppressContentEditableWarning>
              <SuggestMenu
                onSuggestions={onSuggestions}
                placeholder="type title and/or author for suggestions..."
                suggestType="sources"
              >
                <SuggestSources />
              </SuggestMenu>
            </View>
          )}

          {block.__showTopicMenu && (
            <View contentEditable="false" suppressContentEditableWarning>
              <SuggestMenu
                onSuggestions={onSuggestions}
                placeholder="start typing topic for suggestions..."
                suggestType="topics"
              >
                <SuggestTopics onSuggestions={onSuggestions} />
              </SuggestMenu>
            </View>
          )}

          {block.__showInlineTopicMenu && (
            <View contentEditable="false" suppressContentEditableWarning>
              <SuggestMenu
                inlineAtomic
                onSuggestions={onSuggestions}
                placeholder="start typing topic for suggestions..."
                suggestType="topics"
              >
                <SuggestTopics onSuggestions={onSuggestions} inlineAtomic />
              </SuggestMenu>
            </View>
          )}

          {isAtomicInlineType(element.type) ? (
            <View
              alignSelf="flex-start"
              flexWrap="nowrap"
              display="inline"
              alignItems="center"
              borderRadius="default"
              data-test-atomic-edit="open"
              pl="tiny"
              pr={!isAtomicClosure(element.type) ? '0' : 'tiny'}
              ml="tinyNegative"
              backgroundColor={
                block.__isActive ? 'background.3' : 'transparent'
              }
              css={{
                cursor: selHasRange ? 'text' : 'pointer',
                caretColor: block.__isActive ? 'transparent' : 'currentcolor',
              }}
              {...(block.__isActive && !isAtomicClosure(element.type)
                ? { onMouseDown: onAtomicMouseDown }
                : {})}
            >
              <Text
                variant={getAtomicStyle(element.type)}
                color={`${isAtomicClosure(element.type) ? 'gray.4' : ''}`}
                display="inline"
              >
                {children}
              </Text>
              {block.__isActive && !isAtomicClosure(element.type) && (
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
    [block, element, searchTerm, spellCheck, previousBlock?.type]
  )
}

export default Element
