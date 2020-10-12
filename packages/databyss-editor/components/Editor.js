import React, { useCallback } from 'react'
import { Slate, Editable } from '@databyss-org/slate-react'
import { Text, Node, Range } from '@databyss-org/slate'
import { useEntryContext } from '@databyss-org/services/entries/EntryProvider'
import linksFinder from 'links-finder'
import matchAll from 'string.prototype.matchall'
import { useEditorContext } from '../state/EditorProvider'
import Leaf from './Leaf'
import Element from './Element'
import FormatMenu from './FormatMenu'
import { selectionHasRange } from '../state/util'
import { stateSelectionToSlateSelection } from '../lib/slateUtils'

const Editor = ({
  children,
  editor,
  autofocus,
  readonly,
  onFocus,
  ...others
}) => {
  const entryContext = useEntryContext()
  const { copy, paste, cut, state } = useEditorContext()

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

  const renderLeaf = useCallback(
    props => <Leaf {...props} readOnly={readOnly} />,
    [searchTerm]
  )

  const { onKeyDown, ...slateProps } = others
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
        const emailMatches = [...matchAll(_string, _emailRegEx)]

        if (emailMatches.length) {
          emailMatches.forEach(e => {
            const _parts = _string.split(e[0])
            if (_parts.length > 1) {
              let offset = 0
              _parts.forEach((part, i) => {
                if (i !== 0) {
                  ranges.push({
                    anchor: { path, offset: offset - e[0].length },
                    focus: { path, offset },
                    url: e[0],
                  })
                }
                offset = offset + part.length + e[0].length
              })
            }
          })
        }

        // check for url in text
        linksFinder.wrapLinks(_string, {
          onMatch: link => {
            // split string by link
            const _parts = _string.split(link)
            if (_parts.length > 1) {
              let offset = 0

              // add url link to markup
              _parts.forEach((part, i) => {
                if (i !== 0) {
                  const _range = {
                    anchor: { path, offset: offset - link.length },
                    focus: { path, offset },
                    url: link,
                  }
                  // check to see if this range is already included as an email address range
                  if (!ranges.filter(r => Range.includes(r, _range)).length) {
                    ranges.push(_range)
                  }
                }

                offset = offset + part.length + link.length
              })
            }
          },
        })
      }

      // // if an inline atomic is on current block, scan text and tag the text with a menu markup
      // if (Text.isText(node) && Range.isCollapsed(editor.selection)) {
      //   const _currentIndex = editor.selection.anchor.path[0]
      //   const _blockIndex = path[0]
      //   // if selection is on block being examined get current block
      //   if (_currentIndex === _blockIndex) {
      //     const _currentBlock = state.blocks[_currentIndex]
      //     // if in current inline and range has not been activated, trigger inline markup
      //     if (
      //       (_currentBlock.__showInlineTopicMenu ||
      //         _currentIndex.__showInlineCitationMenu) &&
      //       !_currentBlock.__activeInline
      //     ) {
      //       const { word, offset } =
      //         _currentBlock.__showInlineTopicMenu ||
      //         _currentIndex.__showInlineCitationMenu

      //       const _sel = {
      //         anchor: { index: _currentIndex, offset },
      //         focus: { index: _currentIndex, offset: offset + word.length },
      //       }
      //       const selection = stateSelectionToSlateSelection(
      //         editor.children,
      //         _sel
      //       )
      //       selection.inlineAtomicMenu = true

      //       ranges.push(selection)
      //     }
      //   }
      // }

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
    [searchTerm, state.blocks[state.selection.anchor.index]]
  )

  return (
    <Slate editor={editor} {...slateProps}>
      {children}
      {!readonly && <FormatMenu />}
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
