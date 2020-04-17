import React, { useMemo, useCallback } from 'react'
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import Leaf from './Leaf'
import Element from './Element'

const Editor = ({ children, ...others }) => {
  const readOnly = !others.onChange
  const editor = useMemo(() => withReact(createEditor()), [])
  const renderElement = useCallback(
    props => <Element readOnly={readOnly} {...props} />,
    []
  )
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])

  const { onKeyDown, ...slateProps } = others

  return (
    <Slate editor={editor} {...slateProps}>
      {children}
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
