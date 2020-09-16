import React, { useCallback } from 'react'
import { Slate, Editable } from '@databyss-org/slate-react'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { Text, Node } from '@databyss-org/slate'
import { useEntryContext } from '@databyss-org/services/entries/EntryProvider'
import linksFinder from 'links-finder'
import { isMobile } from '@databyss-org/ui/lib/mediaQuery'
import { useEditorContext } from '../state/EditorProvider'
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
  const sessionContext = useSessionContext()

  const { copy, paste, cut } = useEditorContext()

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

      if (Text.isText(node)) {
        // check for url in text
        const _string = Node.string(node)
        linksFinder.wrapLinks(_string, {
          onMatch: link => {
            // split string by link
            const _parts = _string.split(link)
            if (_parts.length > 1) {
              let offset = 0

              // add url link to markup
              _parts.forEach((part, i) => {
                if (i !== 0) {
                  ranges.push({
                    anchor: { path, offset: offset - link.length },
                    focus: { path, offset },
                    url: link,
                  })
                }

                offset = offset + part.length + link.length
              })
            }
          },
        })
      }
      if (!searchTerm.length) {
        return ranges
      }
      // search each word individually
      const _searchTerm = searchTerm.split(' ')

      _searchTerm.forEach(word => {
        if (word && Text.isText(node)) {
          const { text } = node

          // normalize diactritics
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

          if (parts.length > 1) {
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
        }
      })

      return ranges
    },
    [searchTerm]
  )

  return (
    <Slate editor={editor} {...slateProps}>
      {children}
      {!sessionContext?.isPublicAccount() && !isMobile() && <FormatMenu />}
      <Editable
        onCopy={e => {
          e.preventDefault()
          copy(e)
        }}
        onPaste={e => {
          e.preventDefault()
          paste(e)
        }}
        onCut={e => {
          e.preventDefault()
          cut(e)
        }}
        onFocus={onFocus}
        decorate={decorate}
        spellCheck={process.env.NODE_ENV !== 'test'}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        readOnly={readOnly}
        autoFocus={autofocus}
        onKeyDown={onKeyDown}
        style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
        css={{ flexGrow: 1 }}
      />
    </Slate>
  )
}

export default Editor
