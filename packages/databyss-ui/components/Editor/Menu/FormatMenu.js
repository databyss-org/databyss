import React, { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { Button, Text, HoverView } from '@databyss-org/ui/primitives'
import { isMobileOs } from '@databyss-org/ui/'
import space from '@databyss-org/ui/theming/space'
import { useEditorContext } from '../EditorProvider'
import { toggleMark, startTag } from '../state/actions'

// if mobile and line is empty
const mobileActions = [
  // {
  //   type: 'SOURCE',
  //   label: '@',
  //   variant: 'uiTextNormal',
  //   action: a => startTag(a),
  // },
]

const formatActions = [
  // {
  //   type: 'source',
  //   label: '@',
  //   variant: 'uiTextNormal',
  //   action: a => toggleMark(a),
  // },
  {
    type: 'location',
    label: 'loc',
    variant: 'uiTextNormal',
    action: a => toggleMark(a),
  },
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
  ...mobileActions,
]

const formatActionButtons = editor =>
  formatActions.map((a, i) => (
    <MarkButton
      editor={editor}
      index={i}
      type={a.type}
      label={a.label}
      variant={a.variant}
      action={a.action}
    />
  ))

export const Menu = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <HoverView {...props} ref={ref}>
      {children}
    </HoverView>
  )
)

const MarkButton = ({ editor, type, label, variant, action, index }) => {
  const [, dispatchEditor] = useEditorContext()
  const { value } = editor
  const isActive = value.activeMarks.some(mark => mark.type === type)
  const borderRightColor =
    formatActions.length === index + 1 ? 'none' : 'background.5'
  return (
    <Button
      data-test-format-menu={type}
      key={index}
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

const HoverMenu = ({ editor, editableRef }) => {
  const menuRef = useRef(null)
  const root = editableRef.current
    ? editableRef.current.el
    : window.document.getElementById('root')

  const updateMenu = () => {
    const menu = menuRef.current
    if (!menu) return
    const { value } = editor
    const { fragment, selection } = value
    if (selection.isBlurred || selection.isCollapsed || fragment.text === '') {
      menu.removeAttribute('style')
      return
    }

    const native = window.getSelection()
    const range = native.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    menu.style.opacity = 1
    menu.style.top = isMobileOs()
      ? `${rect.bottom + window.pageYOffset + 10}px`
      : `${rect.top + window.pageYOffset - menu.offsetHeight}px`

    // menu offset to prevent overflow

    let menuLeftOffset = 0

    if (menu.offsetWidth / 2 > rect.left + rect.width / 2) {
      menuLeftOffset = menu.offsetWidth / 2 - (rect.left + rect.width / 2)
    }

    if (rect.left + rect.width / 2 + menu.offsetWidth / 2 > window.innerWidth) {
      menuLeftOffset =
        window.innerWidth - (rect.left + rect.width / 2 + menu.offsetWidth / 2)
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

  return ReactDOM.createPortal(
    <Menu ref={menuRef}>{formatActionButtons(editor)}</Menu>,
    root
  )
}

export default HoverMenu
