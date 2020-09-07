import React, { useEffect, useState, useRef } from 'react'
import { Button, Text, View } from '@databyss-org/ui/primitives'
import { useEditor, ReactEditor, useSlate } from '@databyss-org/slate-react'
import { isMobileOs } from '@databyss-org/ui/'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { Editor, Range } from '@databyss-org/slate'
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

const isBackwards = stateSelection => {
  if (stateSelection.anchor.index === stateSelection.focus.index) {
    return stateSelection.anchor.offset - stateSelection.focus.offset > 0
  }
  return stateSelection.anchor.index > stateSelection.focus.index
}
// const isBackwards = (domSelection, editor) => {
//   const stateSelection = slateSelectionToStateSelection(editor)
//   const [isBackwards, setIsBackwards] = useState(false)

//   if (stateSelection.anchor.index === stateSelection.focus.index) {
//     return setIsBackwards(domSelection.anchorOffset - domSelection.focusOffset > 0
//   }

//   return stateSelection.anchor.index > stateSelection.focus.index
// }

const getNumberOfEmptyBlocks = blocks => {
  let countEmptyBlocks = 0

  blocks.forEach(block => {
    if (block.children[0].text === '') {
      return (countEmptyBlocks += 1)
    }
    return 0
  })

  return countEmptyBlocks
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

    // const nonEmptyRects = Object.entries(_rects)
    //   .map(rect => (rect[1].width !== 0 ? rect : null))
    //   .filter(Boolean)

    // const _length = nonEmptyRects.length

    const blocks = editor.getFragment(selection)

    const isBlockEmpty = block => block?.children[0].text === ''

    // get the correct position if you select an empty space
    const backwardsRect =
      blocks[0]?.children[0].text === '' && _rects.length > 1
        ? _rects[1]
        : _rects[0]
    // const backwardsRect = () => {
    //   const countEmptyBlocks = getNumberOfEmptyBlocks(blocks)
    //   const firstBlockIsEmpty = isBlockEmpty(blocks[0])

    //   if (countEmptyBlocks > 1 && firstBlockIsEmpty) {
    //     return nonEmptyRects[countEmptyBlocks - 1]?.[1]
    //   }

    //   return nonEmptyRects[0]?.[1]
    // }

    // const forwardsRect = () => {
    //   const countEmptyBlocks = getNumberOfEmptyBlocks(blocks)
    //   const lastBlockIsEmpty = isBlockEmpty(blocks[_length - 1])

    //   if (countEmptyBlocks > 1 && lastBlockIsEmpty) {
    //     return nonEmptyRects[_length - (countEmptyBlocks + 1)]?.[1]
    //   }

    //   return nonEmptyRects[_length - 1]?.[1]
    // }

    // const getForwardsRectWidth = rect => {
    //   if (nonEmptyRects[_length - 1].width === 0) {
    //     return 0
    //   }
    //   return rect.width
    // }
    const rect = isBackwards ? backwardsRect : _rects[_length - 1]

    // const rect = isBackwards ? backwardsRect() : forwardsRect()

    return setPosition({
      top: pxUnits(rect.top - el?.clientHeight),
      left: pxUnits(rect.left + (isBackwards ? 0 : rect.width)),
      // left: pxUnits(rect.left + (isBackwards ? 0 : getForwardsRectWidth(rect))),
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
        // Editor.string(editor, selection) === '' ||
        // isSelectionAtomic(editor)
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
    // const domRange = domSelection.getRangeAt(0)
    // get selected dom nodes
    // const _rects = domRange.getClientRects()

    if (isTextSelected) {
      const __isBackwards = isSelectionBackwards
      // if (_rects) {
      updatePosition(domSelection, __isBackwards)
      setMenuActive(true)
      // }
    }
  })

  return (
    <HoveringToolbar showToolbar={menuActive} position={position} ref={ref}>
      {formatActionButtons()}
    </HoveringToolbar>
  )
}

export default FormatMenu
