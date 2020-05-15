import React, { useMemo, useCallback } from 'react'
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import Leaf from './Leaf'
import Element from './Element'
import FormatMenu from './FormatMenu'
import CitationsMenu from './CitationsMenu'
import { useEditorContext, EditorContext } from '../state/EditorProvider'

const Editor = ({ children, ...others }) => {
  const editorContext = useEditorContext()
  let state
  let setContent

  const readOnly = !others.onChange
  const editor = useMemo(() => withReact(createEditor()), [])
  const renderElement = useCallback(
    props => {
      // if inside of an editor context
      if (editorContext) {
        state = editorContext.state
        setContent = editorContext.setContent
      }
      return (
        <Element
          readOnly={readOnly}
          state={state}
          setContent={setContent}
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
