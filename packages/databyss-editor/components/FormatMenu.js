import React, { useEffect, useState, useRef } from 'react'
import { Button, Text, View } from '@databyss-org/ui/primitives'
import { useEditor, ReactEditor, useSlate } from '@databyss-org/slate-react'
import { isMobileOs } from '@databyss-org/ui/'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { Node, Editor, Range } from '@databyss-org/slate'
import useEventListener from '@databyss-org/ui/lib/useEventListener'
import HoveringToolbar from './HoveringToolbar'
import {
  isFormatActive,
  toggleMark,
  isSelectionAtomic,
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

const isBackwards = () => {
  const selection = window.getSelection()
  const range = document.createRange()
  try {
    range.setStart(selection.anchorNode, selection.anchorOffset)
    range.setEnd(selection.focusNode, selection.focusOffset)

    const backwards = range.collapsed
    range.detach()
    return backwards
  } catch {
    return false
  }
}

const FormatMenu = () => {
  const editor = useSlate()
  const [menuActive, setMenuActive] = useState(false)
  const [isSelectionBackwards, setIsSelectionBackwards] = useState(false)
  const [position, setPosition] = useState({
    top: -200,
    left: -200,
  })
  // const [menuActive, setMenuActive] = useState(false)
  const ref = useRef()

  const { selection } = editor
  const _selection = slateSelectionToStateSelection(editor)

  const getPosition = () => {
    const el = ref.current
    const _isBackwards = isSelectionBackwards
    const domSelection = window.getSelection()
    const domRange = domSelection.getRangeAt(0)

    // get selected dom nodes
    const _rects = domRange.getClientRects()
    const _length = _rects.length
    const rect = !_isBackwards ? _rects[_length - 1] : _rects[0]

    return setPosition({
      top: pxUnits(rect.top + window.pageYOffset - el?.clientHeight),
      left: pxUnits(
        rect.left + window.pageXOffset + (_isBackwards ? 0 : rect.width)
      ),
    })
  }

  // if selection is backwards, keep that in local state, rerenders will reset backwards selection
  useEffect(
    () => {
      if (editor.selection && !Range.isCollapsed(editor.selection)) {
        const __isBackwards = isBackwards()
        setIsSelectionBackwards(__isBackwards)
      }
    },
    [JSON.stringify(_selection)]
  )

  useEffect(() => {
    if (
      !selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === '' ||
      isSelectionAtomic(editor)
    ) {
      setMenuActive(false)
    }
  })

  useEventListener('mouseup', e => {
    setMenuActive(true)
    getPosition()
  })

  return (
    menuActive && (
      <HoveringToolbar showToolbar={menuActive} position={position} ref={ref}>
        {formatActionButtons()}
      </HoveringToolbar>
    )
  )
}

export default FormatMenu
