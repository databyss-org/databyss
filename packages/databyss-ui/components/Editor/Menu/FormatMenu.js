import React, { useEffect, useRef } from 'react'
import { findDOMNode } from 'slate-react'

import { Button, Text, HoverView, View } from '@databyss-org/ui/primitives'
import { isMobileOs } from '@databyss-org/ui/'
import space from '@databyss-org/ui/theming/space'
import { useEditorContext } from '../EditorProvider'
import { toggleMark, startTag } from '../state/actions'

const mobileActions = [
  {
    type: 'SOURCE',
    label: '+ source',
    variant: 'uiTextNormal',
    action: a => startTag(a),
  },
  {
    type: 'TOPIC',
    label: '+ topic',
    variant: 'uiTextNormal',
    action: a => startTag(a),
  },
  {
    type: 'LOCATION',
    label: '+ location',
    variant: 'uiTextNormal',
    action: a => startTag(a),
  },
]

const webActions = [
  {
    type: 'location',
    label: 'loc',
    variant: 'uiTextNormal',
    action: a => toggleMark(a),
  },
]

const formatActions = isMobileNewLine => [
  ...(isMobileOs() && isMobileNewLine ? mobileActions : webActions),
  // {
  //   type: 'source',
  //   label: '@',
  //   variant: 'uiTextNormal',
  //   action: a => toggleMark(a),
  // },

  // {
  //   type: 'topic',
  //   label: '#',
  //   variant: 'uiTextNormal',
  //   action: a => toggleMark(a),
  // },
  {
    type: 'bold',
    label: 'b',
    variant: 'uiTextNormalSemibold',
    action: a => toggleMark(a),
  },
  {
    type: 'italic',
    label: 'i',
    variant: 'uiTextNormalItalic',
    action: a => toggleMark(a),
  },
]

const formatActionButtons = editor => {
  const isMobileNewLine = window.getSelection().focusOffset === 0
  return formatActions(isMobileNewLine).map((a, i) => (
    <MarkButton
      key={i}
      isMobileNewLine={isMobileNewLine}
      editor={editor}
      index={i}
      type={a.type}
      label={a.label}
      variant={a.variant}
      action={a.action}
    />
  ))
}

export const Menu = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <HoverView {...props} ref={ref}>
      {children}
    </HoverView>
  )
)

const MarkButton = ({
  editor,
  type,
  label,
  variant,
  action,
  index,
  isMobileNewLine,
}) => {
  const [, dispatchEditor] = useEditorContext()
  const { value } = editor
  const isActive = value.activeMarks.some(mark => mark.type === type)

  let borderRightColor =
    formatActions(isMobileNewLine).length === index + 1
      ? 'none'
      : 'background.4'
  if (isMobileNewLine && index === 2 && isMobileOs()) {
    borderRightColor = 'background.2'
  }
  return (
    <Button
      data-test-format-menu={type}
      variant="formatButton"
      borderRightColor={borderRightColor}
      onMouseDown={e => {
        e.preventDefault()
        dispatchEditor(action(type, { value }))
      }}
    >
      <Text
        variant={variant}
        pr={space.small}
        pl={space.small}
        color={isActive ? 'primary.1' : 'background.1'}
      >
        {label}
      </Text>
    </Button>
  )
}

const isActiveSelection = value => {
  const { fragment, selection } = value
  if (selection.isBlurred || selection.isCollapsed || fragment.text === '') {
    return false
  }
  return true
}

const isNewLineOnMobile = value => {
  if (value.anchorBlock) {
    if (value.anchorBlock.text.length === 0 && isMobileOs()) {
      return true
    }
  }

  return false
}

const HoverMenu = ({ editor, editableRef }) => {
  // need to optomize this with hooks
  const menuRef = useRef(null)

  const updateMenu = () => {
    const menu = menuRef.current
    if (!menu) return
    const { value } = editor
    if (!isActiveSelection(value) && !isNewLineOnMobile(value)) {
      menu.removeAttribute('style')
      return
    }

    const native = window.getSelection()
    const range = native.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    // CHECK FOR RANGE AND RENDER
    const _node = findDOMNode(value.document.getNode(value.selection.focus.key))

    const isMobileNewLine = rect.width === 0

    // CHECK FOR TOP OF LINE

    const _mobileOffsetHeight = isMobileNewLine
      ? `${rect.bottom + _node.getBoundingClientRect().top + 32}px`
      : `${rect.bottom + window.pageYOffset + 10}px`

    menu.style.opacity = 1

    menu.style.top = isMobileOs()
      ? _mobileOffsetHeight
      : `${rect.top + window.pageYOffset - menu.offsetHeight}px`

    // menu offset to prevent overflow
    let menuLeftOffset = 0

    if (menu.offsetWidth / 2 > rect.left + rect.width / 2) {
      menuLeftOffset =
        menu.offsetWidth / 2 - (rect.left + rect.width / 2) + space.small
    }

    if (rect.left + rect.width / 2 + menu.offsetWidth / 2 > window.innerWidth) {
      menuLeftOffset =
        window.innerWidth -
        (rect.left + rect.width / 2 + menu.offsetWidth / 2) -
        space.small
    }

    menu.style.left = `${rect.left +
      window.pageXOffset -
      menu.offsetWidth / 2 +
      rect.width / 2 +
      menuLeftOffset}px`
  }

  useEffect(() => {
    updateMenu()
  })

  return <Menu ref={menuRef}>{formatActionButtons(editor)}</Menu>
}

export default HoverMenu
