import React, { useCallback } from 'react'
import { Slate, Editable, ReactEditor } from 'slate-react'
import { Transforms } from 'slate'
import Leaf from './Leaf'
import Element from './Element'
import FormatMenu from './FormatMenu'
import CitationsMenu from './CitationsMenu'
import { useEditorContext } from '../state/EditorProvider'
import { stateSelectionToSlateSelection } from '../lib/slateUtils'

const Editor = ({ children, editor, autofocus, readonly, ...others }) => {
  const readOnly = !others.onChange || readonly
  // const editor = useMemo(() => withReact(createEditor()), [])
  const renderElement = useCallback(
    props => <Element readOnly={readOnly} {...props} />,
    []
  )
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])

  const { onKeyDown, ...slateProps } = others

  const editorContext = useEditorContext()

  // HACK: zero width cursor
  const onClick = () => {
    if (!editor.selection && editorContext) {
      const _sel = stateSelectionToSlateSelection(
        editor.children,
        editorContext.state.selection
      )
      Transforms.select(editor, _sel)
    }
  }

  return (
    <Slate editor={editor} {...slateProps}>
      {children}
      <FormatMenu />
      <CitationsMenu />
      <Editable
        spellCheck={process.env.NODE_ENV !== 'test'}
        onClick={onClick}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        readOnly={readOnly}
        autoFocus={autofocus}
        onKeyDown={onKeyDown}
      />
    </Slate>
  )
}

export default Editor
