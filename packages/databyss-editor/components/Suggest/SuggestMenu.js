import React, { useState, useEffect } from 'react'
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

const SuggestMenu = ({ children, placeholder }) => {
  const [position, setPosition] = useState({
    top: 40,
    left: 0,
    bottom: undefined,
  })
  const [menuActive, setMenuActive] = useState(false)
  const [query, setQuery] = useState(null)
  const [hasSuggestions, setHasSuggestions] = useState(false)

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
    if (e.key === 'Escape' || e.key === 'Enter') {
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
    setHasSuggestions(suggestions?.length)
  }

  console.log('menu active', menuActive)
  console.log('query', query)
  console.log('has suggestions', hasSuggestions)
  return (
    <ClickAwayListener onClickAway={onClickAway}>
      <DropdownContainer
        position={{
          top: position.top,
          left: position.left,
          bottom: position.bottom,
        }}
        open={menuActive && (query || hasSuggestions)}
        widthVariant="dropdownMenuLarge"
        minHeight="32px"
        p="small"
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
