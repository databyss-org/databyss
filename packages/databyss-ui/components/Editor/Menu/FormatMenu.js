import React, { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { Button, Text, HoverView } from '@databyss-org/ui/primitives'
import { isMobileOs } from '@databyss-org/ui/'
import space from '@databyss-org/ui/theming/space'
import { useEditorContext } from '../EditorProvider'
import { toggleMark } from '../state/actions'

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

    menu.style.left = `${rect.left +
      window.pageXOffset -
      menu.offsetWidth / 2 +
      rect.width / 2}px`
  }

  useEffect(() => {
    updateMenu()
  })

  // try to make these in view
  // divider should be view
  // dont create new variant

  return ReactDOM.createPortal(
    <Menu ref={menuRef}>
      {formatActionButtons(editor)}
      {/* <HoverView variant="divider" /> */}
    </Menu>,
    root
  )
}

export default HoverMenu
