import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { Slate, Editable, ReactEditor } from '@databyss-org/slate-react'
import { useBlocksInPages } from '@databyss-org/data/pouchdb/hooks'
import { Text, Node, Editor as SlateEditor } from '@databyss-org/slate'
import { useSearchContext } from '@databyss-org/ui/hooks'
import styledCss from '@styled-system/css'
import { scrollbarResetCss } from '@databyss-org/ui/primitives/View/View'
import { validURL } from '@databyss-org/services/lib/util'
import { useScrollMemory } from '@databyss-org/ui'
import { useEditorContext } from '../state/EditorProvider'
import { TitleElement } from './TitleElement'
import { Leaf } from './Leaf'
import Element from './Element'
import FormatMenu from './FormatMenu'
import { isSelectionCollapsed } from '../lib/clipboardUtils'
import { convertSelectionToLink } from '../lib/inlineUtils/setPageLink'
import { createHighlightRanges, createLinkRangesForUrls } from '../lib/util'

const Editor = ({
  children,
  editor,
  autofocus,
  readonly,
  onFocus,
  onInlineAtomicClick,
  firstBlockIsTitle,
  selection,
  editorRef,
  ...others
}) => {
  const normalizedStemmedTerms = useSearchContext(
    (c) => c && c.normalizedStemmedTerms
  )
  const searchTerm = useSearchContext((c) => c && c.searchTerm)

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

  const readOnly = !others.onChange || readonly
  const renderElement = useCallback((props) => {
    const { element } = props
    if (firstBlockIsTitle && element.isTitle) {
      return <TitleElement {...props} />
    }
    return <Element readOnly={readOnly} {...props} />
  }, [])

  const renderLeaf = useCallback(
    (props) => (
      <Leaf
        {...props}
        readOnly={readOnly}
        onInlineClick={onInlineAtomicClick}
      />
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
        // create links for urls and email addresses
        const _linkRanges = createLinkRangesForUrls(Node.string(node))
        _linkRanges.forEach((_linkRange) => {
          ranges.push({
            anchor: { path, offset: _linkRange.offset },
            focus: { path, offset: _linkRange.offset + _linkRange.length },
            url: _linkRange.marks[0][1],
          })
        })
      }

      if (!normalizedStemmedTerms.length) {
        return ranges
      }
      // search each word individually
      if (Text.isText(node) && !node.inlineAtomicMenu) {
        const _highlightRanges = createHighlightRanges(
          node.text,
          normalizedStemmedTerms
        )
        // if (_highlightRanges.length) {
        //   console.log('[Editor] highlightRanges', _highlightRanges)
        // }
        _highlightRanges.forEach((_highlightRange) => {
          ranges.push({
            anchor: { path, offset: _highlightRange.offset },
            focus: {
              path,
              offset: _highlightRange.offset + _highlightRange.length,
            },
            highlight: true,
          })
        })
      }

      return ranges
    },
    [searchTerm]
  )

  const _editorRef = useRef(null)

  const _restoreScroll = useScrollMemory(_editorRef)

  useEffect(() => {
    _editorRef.current = ReactEditor.toDOMNode(editor, editor)
    if (editorRef) {
      editorRef.current = _editorRef.current
    }
    _restoreScroll()
  }, [])

  const dragHandler = (e) => {
    e.preventDefault()
    // e.stopPropagation()
    return false
  }

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
          onDragOverCapture={dragHandler}
          onDragOver={dragHandler}
          onDragLeaveCapture={dragHandler}
          onDragLeave={dragHandler}
          onDropCapture={dragHandler}
          onDrop={dragHandler}
          decorate={decorate}
          spellCheck={process.env.NODE_ENV !== 'test'}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          readOnly={readOnly}
          autoFocus={autofocus}
          onKeyDown={onKeyDown}
          style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
          css={styledCss({
            // pointerEvents: state.dragActive ? 'none' : 'all',
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
    [editor, selection, searchTerm, readOnly]
  )
}

export default Editor
