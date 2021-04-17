import React, { useCallback } from 'react'
import { Slate, Editable } from '@databyss-org/slate-react'
import { useBlocksInPages } from '@databyss-org/data/pouchdb/hooks'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { Text, Node } from '@databyss-org/slate'
import { useSearchContext } from '@databyss-org/ui/hooks'
import matchAll from 'string.prototype.matchall'
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
  onInlineAtomicClick,
  ...others
}) => {
  const _searchTerm = useSearchContext((c) => c && c.searchTerm)

  // preloads source and topic cache to be used by the suggest menu
  useBlocksInPages('SOURCE')
  useBlocksInPages('TOPIC')

  const { copy, paste, cut } = useEditorContext()

  let searchTerm = ''

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
  }

  if (_searchTerm) {
    searchTerm = escapeRegExp(_searchTerm)
  }

  const readOnly = !others.onChange || readonly
  // const editor = useMemo(() => withReact(createEditor()), [])
  const renderElement = useCallback(
    (props) => <Element readOnly={readOnly} {...props} />,
    []
  )

  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)

  const onInlineClick = useCallback(({ atomicType, id }) => {
    if (isPublicAccount()) {
      return
    }
    onInlineAtomicClick({ type: atomicType, refId: id })
  }, [])

  const renderLeaf = useCallback(
    (props) => (
      <Leaf {...props} readOnly={readOnly} onInlineClick={onInlineClick} />
    ),
    [searchTerm]
  )

  const { onKeyDown, ...slateProps } = others

  // TODO: extract this to a library file
  const decorate = useCallback(
    ([node, path]) => {
      const ranges = []

      if (Text.isText(node)) {
        const _string = Node.string(node)

        // check for email addresses
        const _emailRegEx = new RegExp(
          /\b([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)\b/,
          'gi'
        )
        // check for url in text
        // uri's must begin with "http:// or "https://"
        // test it here: https://regexr.com/5jvei
        const _uriRegEx = new RegExp(
          /https?:\/\/[-a-zA-Z0-9\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF:.]{2,256}(\/?[-a-zA-Z0-9\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF@:%_+.~#&?/=,[\]()]*)?([-a-zA-Z0-9\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF@%_+~#&/=])/,
          'gi'
        )
        ;[_emailRegEx, _uriRegEx].forEach((_regex) => {
          const _matches = [...matchAll(_string, _regex)]
          _matches.forEach((e) => {
            const _parts = _string.split(e[0])
            let offset = 0
            _parts.forEach((part, i) => {
              if (i !== 0) {
                const _range = {
                  anchor: { path, offset: offset - e[0].length },
                  focus: { path, offset },
                  url: e[0],
                }
                // check to see if this range is already included as a range
                // NOTE: enable this if patterns might overlap
                // if (!ranges.filter((r) => Range.includes(r, _range)).length) {
                //   ranges.push(_range)
                // }
                ranges.push(_range)
              }
              offset = offset + part.length + e[0].length
            })
          })
        })
      }

      if (!searchTerm.length) {
        return ranges
      }
      // search each word individually
      const _searchTerm = searchTerm.split(' ')

      _searchTerm.forEach((word) => {
        if (word && Text.isText(node) && !node.inlineAtomicMenu) {
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
      {!readonly && <FormatMenu />}
      <Editable
        onCopy={(e) => {
          e.preventDefault()
          copy(e)
        }}
        onPaste={(e) => {
          e.preventDefault()
          paste(e)
        }}
        onCut={(e) => {
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
