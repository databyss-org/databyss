import React, { useCallback } from 'react'
import { Slate, Editable } from 'slate-react'
import { Text, Editor as SlateEditor } from '@databyss-org/slate'
import { useEntryContext } from '@databyss-org/services/entries/EntryProvider'
import { useEditorContext } from '../state/EditorProvider'
import Leaf from './Leaf'
import Element from './Element'
import FormatMenu from './FormatMenu'
import CitationsMenu from './CitationsMenu'

const Editor = ({ children, editor, autofocus, readonly, ...others }) => {
  const entryContext = useEntryContext()
  const { copy, paste } = useEditorContext()

  let searchTerm = ''

  if (entryContext) {
    searchTerm = entryContext.searchTerm
  }

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
      // search each word individually
      const _searchTerm = searchTerm.split(' ')
      _searchTerm.forEach(word => {
        if (word && Text.isText(node)) {
          const { text } = node
          // match exact word
          const parts = text.split(new RegExp(`\\b${word}\\b`, 'i'))
          let offset = 0

          parts.forEach((part, i) => {
            if (i !== 0) {
              ranges.push({
                anchor: { path, offset: offset - word.length },
                focus: { path, offset },
                highlight: true,
              })
            }

            offset = offset + part.length + word.length
          })
        }
      })

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
        onCopy={e => {
          e.preventDefault()
          copy(e)
        }}
        onPaste={e => {
          e.preventDefault()
          paste(e)
        }}
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
