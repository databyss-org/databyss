import React, { useEffect, useState, useRef } from 'react'
import { Button, Text, View } from '@databyss-org/ui/primitives'
import { useEditor, ReactEditor, useSlate } from '@databyss-org/slate-react'
import { isMobileOs } from '@databyss-org/ui/'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { Range } from '@databyss-org/slate'
import useEventListener from '@databyss-org/ui/lib/useEventListener'
import HoveringToolbar from './HoveringToolbar'
import {
  isFormatActive,
  toggleMark,
  slateSelectionToStateSelection,
} from './../lib/slateUtils'

const mobileActions = [
  {
    type: 'SOURCE',
    label: '+ source',
    variant: 'uiTextNormal',
  },
  {
    type: 'TOPIC',
    label: '+ topic',
    variant: 'uiTextNormal',
  },
  {
    type: 'LOCATION',
    label: '+ location',
    variant: 'uiTextNormal',
  },
]

const desktopActions = [
  {
    type: 'location',
    label: 'loc',
    variant: 'uiTextNormal',
  },
]

const formatActions = isMobileNewLine => [
  ...(isMobileOs() && isMobileNewLine ? mobileActions : desktopActions),
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

const formatActionButtons = () =>
  // placeholder for mobile actions
  true
    ? formatActions(true).reduce((acc, a, i) => {
        if (a.type === 'DIVIDER') {
          return acc.concat(
            <View
              key={i}
              borderRightColor="border.1"
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

const MarkButton = ({ type, label, variant, ...others }) => {
  const editor = useEditor()
  const isActive = isFormatActive(editor, type)

  const toggleFormat = format => {
    toggleMark(editor, format)
  }

  const actions = type =>
    ({
      bold: () => toggleFormat(type),
      italic: () => toggleFormat(type),
      location: () => toggleFormat(type),
    }[type])

  return (
    <Button
      data-test-format-menu={type}
      variant="formatButton"
      onMouseDown={e => {
        e.preventDefault()
        actions(type)()
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

const isBackwards = stateSelection => {
  if (stateSelection.anchor.index === stateSelection.focus.index) {
    return stateSelection.anchor.offset - stateSelection.focus.offset > 0
  }
  return stateSelection.anchor.index > stateSelection.focus.index
}

const FormatMenu = () => {
  const ref = useRef()
  const editor = useSlate()
  const [menuActive, setMenuActive] = useState(false)
  const [isSelectionBackwards, setIsSelectionBackwards] = useState(false)
  const [position, setPosition] = useState({
    top: -200,
    left: -200,
  })
  const { selection } = editor
  const domSelection = window.getSelection()

  const updatePosition = (domSelection, isBackwards) => {
    const el = ref.current

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

    const rect = isBackwards ? backwardsRect : _rects[_length - 1]

    return setPosition({
      top: pxUnits(rect.top - el?.clientHeight),
      left: pxUnits(rect.left + (isBackwards ? 0 : rect.width)),
    })
  }

  useEffect(
    () => {
      const stateSelection = slateSelectionToStateSelection(editor)

      if (editor.selection && !Range.isCollapsed(editor.selection)) {
        const __isBackwards = isBackwards(stateSelection)
        setIsSelectionBackwards(__isBackwards)
      }
    },
    [domSelection.isCollapsed]
  )

  useEffect(
    () => {
      const domSelection = window.getSelection()

      const dontShowMenu =
        !selection ||
        !ReactEditor.isFocused(editor) ||
        Range.isCollapsed(selection) ||
        domSelection.isCollapsed === true

      if (dontShowMenu) {
        setMenuActive(false)
      }
    },
    [editor.selection]
  )

  useEventListener('mouseup', () => {
    const domSelection = window.getSelection()
    const isTextSelected = domSelection.isCollapsed === false

    if (isTextSelected) {
      const __isBackwards = isSelectionBackwards

      updatePosition(domSelection, __isBackwards)
      setMenuActive(true)
    }
  })

  return (
    <HoveringToolbar showToolbar={menuActive} position={position} ref={ref}>
      {formatActionButtons()}
    </HoveringToolbar>
  )
}

export default FormatMenu
