import React, { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { cx, css } from 'emotion'
import { useEditorContext } from '../EditorProvider'
import { toggleMark } from '../state/actions'

export const Menu = React.forwardRef(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    className={cx(
      className,
      css`
        & > * {
          display: inline-block;
        }
        & > * + * {
          margin-left: 15px;
        }
      `
    )}
  />
))

const MarkButton = ({ editor, type, icon }) => {
  const [editorState, dispatchEditor] = useEditorContext()
  const { value } = editor
  const isActive = value.activeMarks.some(mark => mark.type === type)

  return (
    <button
      onMouseDown={e => {
        e.preventDefault()
        dispatchEditor(toggleMark(type, { value }))
        // console.log(type)
      }}
    >
      {type}
    </button>
    // <Button
    //   reversed
    //   active={isActive}
    //   onMouseDown={event => {
    //     event.preventDefault()
    //     editor.toggleMark(type)
    //   }}
    // >
    //   <Icon>{icon}</Icon>
    // </Button>
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
    <Menu
      ref={menuRef}
      className={css`
        padding: 8px 7px 6px;
        position: absolute;
        z-index: 1;
        top: -10000px;
        left: -10000px;
        margin-top: -6px;
        opacity: 0;
        background-color: #222;
        border-radius: 4px;
        transition: opacity 0.75s;
      `}
    >
      <MarkButton editor={editor} type="bold" />
      <MarkButton editor={editor} type="italic" />
      <MarkButton editor={editor} type="location" />
    </Menu>,
    root
  )
}

export default HoverMenu
