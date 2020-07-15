import React, { useCallback } from 'react'
import { Slate, Editable } from 'slate-react'
import { Text } from '@databyss-org/slate'
import { useEntryContext } from '@databyss-org/services/entries/EntryProvider'
import Leaf from './Leaf'
import Element from './Element'
import FormatMenu from './FormatMenu'

const Editor = ({
  children,
  editor,
  autofocus,
  readonly,
  onFocus,
  ...others
}) => {
  const entryContext = useEntryContext()
  let searchTerm = ''

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
  }

  if (entryContext) {
    searchTerm = escapeRegExp(entryContext.searchTerm)
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

      //  console.log(_searchTerm)
      _searchTerm.forEach(word => {
        if (word && Text.isText(node)) {
          const { text } = node

          const parts = text
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .split(
              new RegExp(
                `\\b${word
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')}\\b`,
                'i'
              )
            )

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
      <Editable
        onFocus={onFocus}
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
