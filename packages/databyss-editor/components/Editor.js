import React, { useMemo, useCallback, useRef } from 'react'
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import Leaf from './Leaf'
import Element from './Element'
import FormatMenu from './FormatMenu'
import CitationsMenu from './CitationsMenu'
import { useEditorContext } from '../state/EditorProvider'

const Editor = ({ children, ...others }) => {
  const editorContext = useEditorContext()
  let setContent

  const readOnly = !others.onChange
  const editor = useMemo(() => withReact(createEditor()), [])

  // prevents elements from re-rendering on every state change
  const pageState = useRef(null)
  pageState.current = editorContext.state

  const renderElement = useCallback(
    props => {
      if (editorContext) {
        setContent = editorContext.setContent
      }
      return (
        <Element
          readOnly={readOnly}
          setContent={setContent}
          state={pageState}
          {...props}
        />
      )
    },

    []
  )

  const renderLeaf = useCallback(props => <Leaf {...props} />, [])

  const { onKeyDown, ...slateProps } = others

  return (
    <Slate editor={editor} {...slateProps}>
      {children}
      <FormatMenu />
      <CitationsMenu />
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
