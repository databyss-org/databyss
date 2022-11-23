import React, { useState, useEffect, useRef } from 'react'
import { useEditor, ReactEditor } from '@databyss-org/slate-react'
import { Node, Editor } from '@databyss-org/slate'
import ClickAwayListener from '@databyss-org/ui/components/Util/ClickAwayListener'
import useEventListener from '@databyss-org/ui/lib/useEventListener'
import { Text, View } from '@databyss-org/ui/primitives'
import DropdownContainer from '@databyss-org/ui/components/Menu/DropdownContainer'
import { useEditorContext } from '../../state/EditorProvider'
import { isAtomicInlineType } from '../../lib/util'
import { getClosureType, getTextOffsetWithRange } from '../../state/util'

const MENU_HEIGHT = 200

export const getPosition = ({
  editor,
  inlineAtomic,
  inlineEmbed,
  inlineLink,
}) => {
  if (editor.selection) {
    const _activeNode = editor.children[editor.selection.anchor.path[0]]
    let _node = null
    try {
      _node = ReactEditor.toDOMNode(editor, _activeNode)
    } catch {
      // noop
    }

    if (_node) {
      const _rect = _node.getBoundingClientRect()

      const _inlineEmbedMenu =
        inlineEmbed && document.getElementById('inline-embed-input')
          ? 'inline-embed-input'
          : null

      const getInlineMenuId =
        inlineAtomic && document.getElementById('inline-atomic')
          ? 'inline-atomic'
          : null

      const _inlineLinkMenu =
        inlineLink && document.getElementById('inline-link-input')
          ? 'inline-link-input'
          : null

      const _elId = _inlineEmbedMenu || getInlineMenuId || _inlineLinkMenu

      if (_elId) {
        const _textNode = document.getElementById(_elId).getBoundingClientRect()

        const relativePos = {
          top: _textNode.top - _rect.top + _textNode.height + 10,
          left: _textNode.left - _rect.left,
        }

        const _windowHeight = window.innerHeight

        // check if menu should be above text
        const isMenuTop = _windowHeight < _textNode.bottom + MENU_HEIGHT

        if (isMenuTop) {
          return {
            bottom: '44px',
            left: _textNode.left - _rect.left,
          }
        }

        // if previous block is an atomic closure block move offest down 20px
        const _index = editor.selection.anchor.path[0]
        if (_index > 0) {
          const previousNode = editor.children[_index - 1]
          if (getClosureType(previousNode.type)) {
            relativePos.top += 20
          }
        }

        return relativePos
      }
      const _windowHeight = window.innerHeight

      // check if menu should be above text
      const isMenuTop = _windowHeight < _rect.bottom + MENU_HEIGHT

      if (isMenuTop) {
        return { bottom: '44px', left: 0 }
      }
      // if previous block is an atomic closure block move offest down 15px
      const _prev = Editor.previous(editor)
      if (_prev) {
        const _idx = _prev[1]
        if (getClosureType(editor.children[_idx[0]].type)) {
          return { top: 65, left: 0 }
        }
      }
    }
  }
  return { top: 38, left: 0 }
}

const SuggestMenu = ({
  children,
  placeholder,
  onSuggestions,
  suggestType,
  inlineAtomic,
  inlineEmbed,
  inlineLink,
}) => {
  const activeIndexRef = useRef(-1)
  const [position, setPosition] = useState({
    top: 40,
    left: 0,
    bottom: undefined,
  })
  const [menuActive, setMenuActive] = useState(false)
  const [query, setQuery] = useState(null)

  const [hasSuggestions, setHasSuggestions] = useState(false)
  const [resultsMode, setResultsMode] = useState('')

  const editor = useEditor()
  const editorContext = useEditorContext()

  // set position of dropdown
  const setMenuPosition = () => {
    const _position = getPosition({
      editor,
      inlineAtomic,
      inlineEmbed,
      inlineLink,
    })

    if (_position) {
      setPosition(_position)
    }
  }

  useEffect(() => {
    if (editorContext && ReactEditor.isFocused(editor)) {
      const _index = editorContext.state.selection.anchor.index
      const _node = editor.children[_index]
      const _stateBlock = editorContext.state.blocks[_index]

      if (!(inlineAtomic || inlineEmbed || inlineLink)) {
        // get current input value
        const _text = Node.string(_node)
        if (!isAtomicInlineType(_node.type)) {
          setQuery(_text.substring(1))
          setMenuPosition()

          if (!menuActive) setMenuActive(true)
        } else if (menuActive) {
          setMenuActive(false)
        }
      } else if (!isAtomicInlineType(_node.type)) {
        let _inline = { type: '', prefix: '' }
        if (inlineEmbed) {
          _inline = { type: 'inlineEmbedInput', prefixLength: 2 }
        }
        if (inlineLink) {
          _inline = { type: 'inlineLinkInput', prefixLength: 2 }
        }
        if (inlineAtomic) {
          _inline = { type: 'inlineAtomicMenu', prefixLength: 1 }
        }

        // get current text with markup '_inlineType'
        // get text with active `_inlineType` mark
        const innerText = getTextOffsetWithRange({
          text: _stateBlock.text,
          rangeType: _inline.type,
        })
        if (innerText) {
          setQuery(innerText.text.substring(_inline.prefixLength))
        }

        window.requestAnimationFrame(setMenuPosition)
        setMenuActive(true)
      }
    }
  }, [editor.selection])

  useEventListener('keydown', (e) => {
    if (
      e.key === 'Escape' ||
      (e.key === 'Enter' && activeIndexRef.current < 0)
    ) {
      setMenuActive(false)
    }
  })

  // prevents scroll if modal is visible
  //  useEventListener('wheel', e => menuActive && e.preventDefault(), editor.el)

  const onClickAway = () => {
    if (menuActive) {
      setMenuActive(false)
    }
  }

  const onFocusEditor = () => {
    ReactEditor.focus(editor)
  }

  const onDismiss = () => {
    setMenuActive(false)
    onFocusEditor()
  }

  const onSuggestionsChanged = (suggestions) => {
    onSuggestions(suggestions)
    setHasSuggestions(suggestions?.length)
  }

  const onActiveIndexChanged = (index) => {
    activeIndexRef.current = index
  }

  // if topics and has no suggestions, remove menu,
  // leave if sources for citations loader
  const _showMenu =
    suggestType === 'topics'
      ? menuActive && (!query || hasSuggestions)
      : menuActive

  return (
    <View>
      <ClickAwayListener onClickAway={onClickAway} position="inherit">
        <DropdownContainer
          suggestMenu
          data-test-element="suggest-menu"
          position={{
            top: position.top,
            left: position.left,
            bottom: position.bottom,
          }}
          open={_showMenu}
          widthVariant="dropdownMenuLarge"
          minHeight="32px"
          p={inlineEmbed ? 'none' : 'small'}
          orderKey={query + resultsMode}
          onActiveIndexChanged={onActiveIndexChanged}
        >
          {query || inlineEmbed || inlineLink ? (
            React.cloneElement(React.Children.only(children), {
              editor,
              editorContext,
              activeIndexRef,
              dismiss: onDismiss,
              query,
              menuHeight: MENU_HEIGHT,
              focusEditor: onFocusEditor,
              active: menuActive,
              onSuggestionsChanged,
              resultsMode,
              setResultsMode,
            })
          ) : (
            <View p="small">
              <Text variant="uiTextSmall" color="text.2">
                {placeholder}
              </Text>
            </View>
          )}
        </DropdownContainer>
      </ClickAwayListener>
    </View>
  )
}

export default SuggestMenu
