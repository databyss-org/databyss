import React, { useMemo, useState, useEffect, useRef } from 'react'
import { Text, View } from '@databyss-org/ui/primitives'
import { menuLauncherSize } from '@databyss-org/ui/theming/buttons'
import { ReactEditor, useEditor } from '@databyss-org/slate-react'
import { Range } from '@databyss-org/slate'
import { useSearchContext } from '@databyss-org/ui/hooks'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { useEditorContext } from '../state/EditorProvider'
import BlockMenu from './BlockMenu'
import { isAtomicInlineType } from '../lib/util'
import {
  SuggestMenu,
  SuggestSources,
  SuggestTopics,
  SuggestEmbeds,
} from './Suggest'
import { EmbedMedia } from './EmbedMedia'
import SuggestLinks from './Suggest/SuggestLinks'
import { ElementView } from './ElementView'
import { AtomicHeader } from './AtomicHeader'
// browser still takes some time to process the spellcheck
const SPELLCHECK_DEBOUNCE_TIME = 300

const Element = ({ attributes, children, element, readOnly }) => {
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)
  const _isPublic = isPublicAccount ? isPublicAccount() : null

  const _searchTerm = useSearchContext((c) => c && c.searchTerm)

  let searchTerm = ''

  if (_searchTerm) {
    searchTerm = _searchTerm
  }
  const editor = useEditor()

  const editorContext = useEditorContext()

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

      if (element.embed) {
        return (
          <EmbedMedia
            _children={children}
            attributes={attributes}
            _element={element}
          />
        )
      }

      const blockMenuWidth = menuLauncherSize + 6

      const selHasRange = !Range.isCollapsed(editor.selection)

      return (
        <ElementView
          index={blockIndex}
          spellCheck={spellCheck}
          data-test-editor-element="true"
          readOnly={readOnly}
          block={block}
          previousBlock={previousBlock}
          isBlock={element.isBlock}
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

          {block.__showInlineCitationMenu && (
            <View contentEditable="false" suppressContentEditableWarning>
              <SuggestMenu
                inlineAtomic
                onSuggestions={onSuggestions}
                placeholder="type title and/or author for suggestions..."
                suggestType="sources"
              >
                <SuggestSources inlineAtomic onSuggestions={onSuggestions} />
              </SuggestMenu>
            </View>
          )}

          {block.__showInlineEmbedMenu && (
            <View contentEditable="false" suppressContentEditableWarning>
              <SuggestMenu
                inlineEmbed
                onSuggestions={onSuggestions}
                suggestType="embed"
              >
                <SuggestEmbeds />
              </SuggestMenu>
            </View>
          )}

          {block.__showInlineLinkMenu && (
            <View contentEditable="false" suppressContentEditableWarning>
              <SuggestMenu
                inlineLink
                onSuggestions={onSuggestions}
                suggestType="link"
              >
                <SuggestLinks />
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
            <AtomicHeader
              readOnly={readOnly}
              selHasRange={selHasRange}
              block={block}
            >
              {children}
            </AtomicHeader>
          ) : (
            <Text {...attributes}>{children}</Text>
          )}
        </ElementView>
      )
    },
    // search term updates element for highlight
    [block, element, searchTerm, spellCheck, previousBlock?.type]
  )
}

export default Element
