import React, { useCallback } from 'react'
import { Slate, Editable } from 'slate-react'
import { Text } from 'slate'
import { useEntryContext } from '@databyss-org/services/entries/EntryProvider'
import Leaf from './Leaf'
import Element from './Element'
import FormatMenu from './FormatMenu'
import CitationsMenu from './CitationsMenu'

const Editor = ({ children, editor, autofocus, readonly, ...others }) => {
  const { searchTerm } = useEntryContext()

  const readOnly = !others.onChange || readonly
  // const editor = useMemo(() => withReact(createEditor()), [])
  const renderElement = useCallback(
    props => <Element readOnly={readOnly} {...props} />,
    []
  )
  const renderLeaf = useCallback(props => <Leaf {...props} />, [searchTerm])

  const { onKeyDown, ...slateProps } = others

  const decorate = useCallback(
    ([node, path]) => {
      const ranges = []
      if (searchTerm && Text.isText(node)) {
        const { text } = node
        const parts = text.split(searchTerm)
        let offset = 0

        parts.forEach((part, i) => {
          if (i !== 0) {
            ranges.push({
              anchor: { path, offset: offset - searchTerm.length },
              focus: { path, offset },
              highlight: true,
            })
          }

          offset = offset + part.length + searchTerm.length
        })
      }
      return ranges
    },
    [searchTerm]
  )

  return (
    <Slate editor={editor} {...slateProps}>
      {children}
      <FormatMenu />
      <CitationsMenu />
      <Editable
        decorate={decorate}
        spellCheck={process.env.NODE_ENV !== 'test'}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        readOnly={readOnly}
        autoFocus={autofocus}
        onKeyDown={onKeyDown}
        css={{ flexGrow: 1 }}
      />
    </Slate>
  )
}

export default Editor
