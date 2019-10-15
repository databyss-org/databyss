import React, { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { cx, css } from 'emotion'
import { Button, Text, HoverView } from '@databyss-org/ui/primitives'
import { useEditorContext } from '../EditorProvider'
import { toggleMark } from '../state/actions'

const formatActions = [
  {
    type: 'bold',
    label: 'b',
    variant: 'uiTextNormalSemibold',
    action: a => toggleMark(a),
  },
  {
    type: 'italic',
    label: 'i',
    variant: 'bodyNormalItalic',
    action: a => toggleMark(a),
  },
  {
    type: 'location',
    label: 'loc',
    variant: 'bodyNormal',
    action: a => toggleMark(a),
  },
]

const formatActionButtons = editor =>
  formatActions.map(a => (
    <MarkButton
      editor={editor}
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

const MarkButton = ({ editor, type, label, variant, action }) => {
  const [editorState, dispatchEditor] = useEditorContext()
  const { value } = editor
  const isActive = value.activeMarks.some(mark => mark.type === type)

  return (
    <Button
      variant="formatButton"
      onMouseDown={e => {
        e.preventDefault()
        dispatchEditor(action(type, { value }))
      }}
    >
      <Text variant={variant} color={isActive ? 'primary.1' : 'background.1'}>
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

  useEffect(() => {
    updateMenu()
  })

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
    menu.style.top = `${rect.top + window.pageYOffset - menu.offsetHeight}px`

    menu.style.left = `${rect.left +
      window.pageXOffset -
      menu.offsetWidth / 2 +
      rect.width / 2}px`
  }

  return ReactDOM.createPortal(
    <Menu ref={menuRef}>{formatActionButtons(editor)}</Menu>,
    root
  )
}

export default HoverMenu
