import React, { useState, useEffect, useRef } from 'react'
import { useEditor, ReactEditor } from '@databyss-org/slate-react'
import { Node, Editor } from '@databyss-org/slate'
import ClickAwayListener from '@databyss-org/ui/components/Util/ClickAwayListener'
import useEventListener from '@databyss-org/ui/lib/useEventListener'
import { Text, View } from '@databyss-org/ui/primitives'
import DropdownContainer from '@databyss-org/ui/components/Menu/DropdownContainer'
import { useEditorContext } from '../../state/EditorProvider'
import { isAtomicInlineType } from '../../lib/util'
import { getClosureType } from '../../state/util'

const MENU_HEIGHT = 200

export const getPosition = editor => {
  if (editor.selection) {
    const _activeNode = editor.children[editor.selection.anchor.path[0]]
    const _node = ReactEditor.toDOMNode(editor, _activeNode)
    if (_node) {
      const _rect = _node.getBoundingClientRect()
      const _windowHeight = window.innerHeight

      // check if menu should be above text
      const isMenuTop = _windowHeight < _rect.bottom + MENU_HEIGHT

      if (isMenuTop) {
        return { bottom: 40, left: 0 }
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
  return { top: 40, left: 0 }
}

const SuggestMenu = ({ children, placeholder, onSuggestions, suggestType }) => {
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
    const _position = getPosition(editor)

    if (_position) {
      setPosition(_position)
    }
  }

  useEffect(
    () => {
      if (editorContext && ReactEditor.isFocused(editor)) {
        // get current input value
        const _index = editorContext.state.selection.anchor.index
        const _node = editor.children[_index]
        const _text = Node.string(_node)
        if (!isAtomicInlineType(_node.type)) {
          setQuery(_text.substring(1))
          setMenuPosition()
          if (!menuActive) setMenuActive(true)
        } else if (menuActive) {
          setMenuActive(false)
        }
      } else if (menuActive) {
        setMenuActive(false)
      }
    },
    [editor.selection]
  )

  useEventListener('keydown', e => {
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

  const onSuggestionsChanged = suggestions => {
    onSuggestions(suggestions)
    setHasSuggestions(suggestions?.length)
  }

  const onActiveIndexChanged = index => {
    activeIndexRef.current = index
  }

  // if topics and has no suggestions, remove menu,
  // leave if sources for citations loader
  const _showMenu =
    suggestType === 'topics'
      ? menuActive && (!query || hasSuggestions)
      : menuActive
  return (
    <ClickAwayListener onClickAway={onClickAway}>
      <DropdownContainer
        position={{
          top: position.top,
          left: position.left,
          bottom: position.bottom,
        }}
        open={_showMenu}
        widthVariant="dropdownMenuLarge"
        minHeight="32px"
        p="small"
        orderKey={query + resultsMode}
        onActiveIndexChanged={onActiveIndexChanged}
      >
        {query ? (
          React.cloneElement(React.Children.only(children), {
            editor,
            editorContext,
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
  )
}

export default SuggestMenu
