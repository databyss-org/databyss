import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Button, Text, View, Icon } from '@databyss-org/ui/primitives'
import { useEditor, ReactEditor, useSlate } from '@databyss-org/slate-react'
import { pxUnits } from '@databyss-org/ui/theming/views'
import LinkSVG from '@databyss-org/ui/assets/external-link.svg'
import { Range, Node } from '@databyss-org/slate'
import useEventListener from '@databyss-org/ui/lib/useEventListener'
import HoveringToolbar from './HoveringToolbar'
import {
  isFormatActive,
  toggleMark,
  slateSelectionToStateSelection,
} from './../lib/slateUtils'
import { getInlineOrAtomicsFromStateSelection } from '../state/util'
import { useEditorContext } from '../state/EditorProvider'
import { useNavigationContext } from '@databyss-org/ui/components'

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

const MarkButton = ({ type, label, variant, atomicId, ...others }) => {
  const { navigate } = useNavigationContext()

  const onNavigation = useCallback(() => {
    // TODO: OPEN IN NEW TAB
    navigate(`/pages/${atomicId}`)
  }, [])

  const editor = useEditor()
  const isActive = isFormatActive(editor, type)

  if (type === 'link') {
    return (
      <Button variant="editSource" onPress={onNavigation}>
        <Icon sizeVariant="small" color="background.5">
          <LinkSVG />
        </Icon>
      </Button>
    )
  }

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

const isBackwards = (stateSelection) => {
  if (stateSelection.anchor.index === stateSelection.focus.index) {
    return stateSelection.anchor.offset - stateSelection.focus.offset > 0
  }
  return stateSelection.anchor.index > stateSelection.focus.index
}

const FormatMenu = () => {
  const { state } = useEditorContext()
  const ref = useRef()
  const editor = useSlate()
  const [linkMenuActive, setLinkMenuActive] = useState(false)
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
      top: pxUnits(rect.top + window.pageYOffset - el?.offsetHeight),
      left: pxUnits(rect.left + (isBackwards ? 0 : rect.width)),
    })
  }

  const formatActionButtons = () =>
    !linkMenuActive ? (
      formatActions(true).reduce((acc, a, i) => {
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
    ) : (
      <MarkButton
        key="link"
        index={0}
        type="link"
        label="icon"
        atomicId={linkMenuActive}
        variant="uiTextNormalItalic"
      />
    )

  useEffect(() => {
    const stateSelection = slateSelectionToStateSelection(editor)

    if (editor.selection && !Range.isCollapsed(editor.selection)) {
      const __isBackwards = isBackwards(stateSelection)
      setIsSelectionBackwards(__isBackwards)
    }
  }, [domSelection.isCollapsed])

  const openFormatMenu = () => {
    const _atomics = getInlineOrAtomicsFromStateSelection(state)

    if (Range.isCollapsed(selection) || _atomics.length) {
      return
    }
    const domSelection = window.getSelection()
    const isTextSelected = domSelection.isCollapsed === false

    if (isTextSelected) {
      const __isBackwards = isSelectionBackwards
      updatePosition(domSelection, __isBackwards)
      setMenuActive(true)
    }
  }

  useEffect(() => {
    // set link menu position
    if (linkMenuActive && Range.isCollapsed(selection)) {
      const domSelection = window.getSelection()
      updatePosition(domSelection)
    }
  }, [linkMenuActive, selection])

  useEffect(() => {
    const domSelection = window.getSelection()

    /*
    check if selection contains inline atomics or inline sources
    */
    const _atomics = getInlineOrAtomicsFromStateSelection(state)

    const dontShowMenu =
      !selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(selection) ||
      domSelection.isCollapsed === true ||
      !!_atomics.length

    if (dontShowMenu) {
      setMenuActive(false)
    }

    const _currentLeaf = Node.leaf(editor, editor.selection.focus.path)
    // check if in an active link
    if (_currentLeaf?.link) {
      // setMenuActive(true)
      setLinkMenuActive(_currentLeaf.atomicId)
      openFormatMenu()
    } else if (linkMenuActive) {
      // setMenuActive(false)
      setLinkMenuActive(false)
    }
  }, [editor.selection])

  useEventListener('mouseup', () => {
    openFormatMenu()
  })

  useEventListener('keyup', () => {
    openFormatMenu()
  })

  useEventListener('wheel', () => {
    if (menuActive) {
      setMenuActive(false)
    }
  })

  return (
    <HoveringToolbar
      showToolbar={menuActive || linkMenuActive}
      position={position}
      ref={ref}
    >
      {formatActionButtons()}
    </HoveringToolbar>
  )
}

export default FormatMenu
