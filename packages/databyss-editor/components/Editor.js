import React, { useMemo, useCallback } from 'react'
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import Leaf from './Leaf'
import Element from './Element'
import FormatMenu from './FormatMenu'

const Editor = ({ children, ...others }) => {
  const readOnly = !others.onChange
  const editor = useMemo(() => withReact(createEditor()), [])
  const renderElement = useCallback(
    props => <Element readOnly={readOnly} {...props} />,
    []
  )
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])

  const { onKeyDown, onFocus, ...slateProps } = others
  const { modals } = useNavigationContext()
  console.log('IS READ ONLY', modals.length > 0)

  return (
    <Slate editor={editor} {...slateProps}>
      {children}
      <FormatMenu />
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        readOnly={readOnly || modals.length > 0}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
      />
    </Slate>
  )
}

export default Editor
