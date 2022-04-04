import React, { useCallback, useMemo } from 'react'
import { Slate, Editable } from '@databyss-org/slate-react'
import { useBlocksInPages } from '@databyss-org/data/pouchdb/hooks'
import { Text, Node, Editor as SlateEditor } from '@databyss-org/slate'
import { useSearchContext } from '@databyss-org/ui/hooks'
import styledCss from '@styled-system/css'
import { scrollbarResetCss } from '@databyss-org/ui/primitives/View/View'
import { validUriRegex, validURL } from '@databyss-org/services/lib/util'
import matchAll from 'string.prototype.matchall'
import { useEditorContext } from '../state/EditorProvider'
import { TitleElement } from './TitleElement'
import Leaf from './Leaf'
import Element from './Element'
import FormatMenu from './FormatMenu'
import { isSelectionCollapsed } from '../lib/clipboardUtils'
import { convertSelectionToLink } from '../lib/inlineUtils/setPageLink'

const Editor = ({
  children,
  editor,
  autofocus,
  readonly,
  onFocus,
  onInlineAtomicClick,
  firstBlockIsTitle,
  selection,
  ...others
}) => {
  const _searchTerm = useSearchContext((c) => c && c.searchTerm)

  // preloads source and topic cache to be used by the suggest menu
  useBlocksInPages('EMBED')
  useBlocksInPages('SOURCE')
  useBlocksInPages('TOPIC')

  const { copy, paste, cut, embedPaste, state } = useEditorContext()

  // check if paste is an embed or regular paste
  const pasteEventHandler = (e) => {
    e.preventDefault()
    const _activeMarks = SlateEditor.marks(editor)
    // if pasting embed code handle seperatly
    if (_activeMarks?.inlineEmbedInput || _activeMarks?.inlineLinkInput) {
      embedPaste({ event: e, inlineType: Object.keys(_activeMarks)[0] })
      return
    }
    if (!isSelectionCollapsed(state.selection)) {
      // check to see if url is being pasted
      const plainTextDataTransfer = e.clipboardData.getData('text/plain')
      if (validURL(plainTextDataTransfer)) {
        convertSelectionToLink({ editor, link: plainTextDataTransfer })
        return
      }
    }
    paste(e)
  }

  let searchTerm = ''

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
  }

  if (_searchTerm) {
    searchTerm = escapeRegExp(_searchTerm)
  }

  const readOnly = !others.onChange || readonly
  // const editor = useMemo(() => withReact(createEditor()), [])
  const renderElement = useCallback((props) => {
    const { element } = props
    if (firstBlockIsTitle && element.isTitle) {
      return <TitleElement {...props} />
    }
    return <Element readOnly={readOnly} {...props} />
  }, [])

  const onInlineClick = useCallback(({ atomicType, id, name }) => {
    onInlineAtomicClick({ type: atomicType, refId: id, name })
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
      if (
        node?.inlineEmbedInput ||
        node?.embed ||
        node?.link ||
        node?.inlineLinkInput
      ) {
        return ranges
      }

      if (Text.isText(node) && !(node?.inlineEmbedInput || node?.embed)) {
        // do not apply markup

        const _string = Node.string(node)

        // check for email addresses
        const _emailRegEx = new RegExp(
          /\b([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)\b/,
          'gi'
        )
        const _validUri = new RegExp(validUriRegex, 'gi')
        ;[_emailRegEx, _validUri].forEach((_regex) => {
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
  console.log('[Editor] readOnly', readOnly)
  return useMemo(
    () => (
      <Slate editor={editor} selection={selection} {...slateProps}>
        {children}
        {!readonly && <FormatMenu />}
        <Editable
          onCopy={(e) => {
            e.preventDefault()
            copy(e)
          }}
          onPaste={pasteEventHandler}
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
          css={styledCss({
            flexGrow: 1,
            overflowY: 'auto',
            paddingLeft: 'em',
            paddingRight: 'medium',
            paddingBottom: 'extraLarge',
            ...scrollbarResetCss,
          })}
        />
      </Slate>
    ),
    [editor, selection, _searchTerm, readOnly]
  )
}

export default Editor
