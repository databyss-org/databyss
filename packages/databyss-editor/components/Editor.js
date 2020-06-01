import React, { useCallback } from 'react'
import { Slate, Editable } from 'slate-react'
import Leaf from './Leaf'
import Element from './Element'
import FormatMenu from './FormatMenu'
import CitationsMenu from './CitationsMenu'

const Editor = ({ children, editor, autofocus, ...others }) => {
  const readOnly = !others.onChange
  // const editor = useMemo(() => withReact(createEditor()), [])
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
      <CitationsMenu />
      <Editable
        spellCheck={process.env.NODE_ENV !== 'test'}
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
