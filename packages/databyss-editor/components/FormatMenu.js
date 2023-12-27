import React, { useEffect, useState, useRef } from 'react'
import { Button, Text, View } from '@databyss-org/ui/primitives'
import { useEditor, ReactEditor, useSlate } from '@databyss-org/slate-react'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { Range } from '@databyss-org/slate'
import useEventListener from '@databyss-org/ui/lib/useEventListener'
import HoveringToolbar from './HoveringToolbar'
import {
  isFormatActive,
  toggleMark,
  slateSelectionToStateSelection,
} from './../lib/slateUtils'
import { getInlineOrAtomicsFromStateSelection } from '../state/util'
import { useEditorContext } from '../state/EditorProvider'

const formatActions = () => [
  {
    type: 'location',
    label: 'loc',
    variant: 'uiTextNormal',
  },
  {
    type: 'DIVIDER',
  },
  {
    type: 'bold',
    label: 'b',
    variant: 'uiTextNormalSemibold',
  },
  {
    type: 'italic',
    label: 'i',
    variant: 'uiTextNormalItalic',
  },
]

const MarkButton = ({ type, label, variant, ...others }) => {
  const editor = useEditor()
  const isActive = isFormatActive(editor, type)

  const toggleFormat = (format) => {
    toggleMark(editor, format)
  }

  const actions = (type) =>
    ({
      bold: () => toggleFormat(type),
      italic: () => toggleFormat(type),
      location: () => toggleFormat(type),
    }[type])

  return (
    <Button
      data-test-format-menu={type}
      variant="formatButton"
      onMouseDown={(e) => {
        e.preventDefault()
        actions(type)()
      }}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          actions(type)()
        }
      }}
      {...others}
    >
      <Text
        variant={variant}
        pr="extraSmall"
        pl="extraSmall"
        color={isActive ? 'primary.1' : 'text.1'}
      >
        {label}
      </Text>
    </Button>
  )
}

const formatActionButtons = () => {
  // FIXME: this should be replaced with a valid condition, or be removed
  const PLACEHOLDER = true

  // placeholder for mobile actions
  return PLACEHOLDER
    ? formatActions(true).reduce((acc, a, i) => {
        if (a.type === 'DIVIDER') {
          return acc.concat(
            <View
              key={i}
              borderRightColor="border.2"
              borderRightWidth={pxUnits(1)}
              marginLeft="extraSmall"
              marginRight="extraSmall"
            />
          )
        }
        return acc.concat(
          <MarkButton
            key={i}
            index={i}
            type={a.type}
            label={a.label}
            variant={a.variant}
          />
        )
      }, [])
    : []
}

const FormatMenu = () => {
  const { state } = useEditorContext()
  const ref = useRef()
  const editor = useSlate()
  const [menuActive, setMenuActive] = useState(false)
  const { selection } = editor
  const domSelection = window.getSelection()

  const openFormatMenu = () => {
    const _atomics = getInlineOrAtomicsFromStateSelection(state)

    if (Range.isCollapsed(selection) || _atomics.length) {
      return
    }
    const domSelection = window.getSelection()
    const isTextSelected = domSelection.isCollapsed === false

    if (isTextSelected) {
      setMenuActive(true)
    }
  }

  useEffect(() => {
    const domSelection = window.getSelection()

    /*
    check if selection contains inline atomics or inline sources
    */
    const _atomics = getInlineOrAtomicsFromStateSelection(state)

    const dontShowMenu =
      !editor.selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(editor.selection) ||
      domSelection.isCollapsed === true ||
      !!_atomics.length

    if (dontShowMenu) {
      setMenuActive(false)
    } else {
      openFormatMenu()
    }
  }, [editor.selection, ref.current])

  useEventListener('wheel', () => {
    if (menuActive) {
      setMenuActive(false)
    }
  })

  if (menuActive) {
    const stateSelection = slateSelectionToStateSelection(editor)
    const selectionIsBackwards =
      editor.selection &&
      !Range.isCollapsed(editor.selection) &&
      stateSelection.anchor.index === stateSelection.focus.index &&
      (stateSelection.anchor.offset - stateSelection.focus.offset > 0 ||
        stateSelection.anchor.index > stateSelection.focus.index)

    const domRange = domSelection.getRangeAt(0)
    // get selected dom nodes
    const _rects = domRange.getClientRects()
    const _length = _rects.length

    const blocks = editor.getFragment(selection)

    // get the correct position if you select an empty space
    const backwardsRect =
      blocks[0]?.children[0].text === '' && _rects.length > 1
        ? _rects[1]
        : _rects[0]

    const rect = selectionIsBackwards ? backwardsRect : _rects[_length - 1]

    return (
      <HoveringToolbar
        selectionRect={rect}
        selectionIsBackwards={selectionIsBackwards}
      >
        {formatActionButtons()}
      </HoveringToolbar>
    )
  }

  return null
}

export default FormatMenu
