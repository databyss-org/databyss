import React, { useMemo, useCallback } from 'react'
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { isAtomicInlineType } from '../lib/util'
import Leaf from './Leaf'
import Element from './Element'
import FormatMenu from './FormatMenu'

export const withInline = editor => {
  const { isInline, isVoid } = editor
  editor.isInline = element =>
    isAtomicInlineType(element.type) ? true : isInline(element)
  editor.isVoid = element =>
    isAtomicInlineType(element.type) ? true : isVoid(element)
  return editor
}

const Editor = ({ children, ...others }) => {
  const readOnly = !others.onChange
  const editor = useMemo(() => withInline(withReact(createEditor())), [])
  const renderElement = useCallback(
    props => <Element readOnly={readOnly} {...props} />,
    []
  )
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])

  const { onKeyDown, ...slateProps } = others

  return (
    <Slate editor={editor} {...slateProps}>
      {children}
      <FormatMenu />
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        readOnly={readOnly}
        onKeyDown={onKeyDown}
      />
    </Slate>
  )
}

export default Editor
