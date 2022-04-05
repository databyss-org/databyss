import React, { ReactNode } from 'react'
import styledCss from '@styled-system/css'
import {
  isAtomicInlineType,
  slateBlockToHtmlWithSearch,
} from '@databyss-org/editor/lib/util'
import {
  Page,
  Text,
  Document,
  DocumentDict,
  Embed,
  Range,
  RangeType,
  InlineRangeType,
  Block,
} from '@databyss-org/services/interfaces'
import { RawHtml, View, Text as TextComponent } from '@databyss-org/ui'
import { scrollbarResetCss } from '@databyss-org/ui/primitives/View/View'
import { ElementView } from '@databyss-org/editor/components/ElementView'
import { InterpolationWithTheme } from '@emotion/core'
import { mergeRanges, SortOptions } from '@databyss-org/services/blocks'
import { InlineTypes, Mark } from '@databyss-org/services/interfaces/Range'
import { Leaf as LeafComponent } from '@databyss-org/editor/components/Leaf'
import { TitleElement } from '@databyss-org/editor/components/TitleElement'
import { useDocuments, usePages } from '@databyss-org/data/pouchdb/hooks'
import LoadingFallback from '../Notify/LoadingFallback'
import { useDocument } from '@databyss-org/data/pouchdb/hooks/useDocument'
import { dbRef } from '@databyss-org/data/pouchdb/db'
import { CouchDb } from '@databyss-org/data/couchdb-client/couchdb'
import {
  AtomicHeader,
  isAtomicClosure,
} from '@databyss-org/editor/components/AtomicHeader'

export const FlatBlock = ({
  index,
  id,
  previousId,
  block,
  previousBlock,
}: {
  index: number
  id: string
  previousId: string | null
  block?: Block
  previousBlock?: Block
}) => {
  const _blockRes = useDocument<Block>(id, { enabled: !block })
  const _previousBlockRes = useDocument<Block>(previousId ?? '', {
    enabled: !block && !!previousId,
  })
  if (!block && !_blockRes.isSuccess) {
    return null
  }
  if (!block && previousId && !_previousBlockRes.isSuccess) {
    return null
  }
  const _block = block ?? _blockRes.data ?? null

  return index ? (
    <ElementView
      block={_block}
      previousBlock={previousBlock ?? _previousBlockRes.data ?? null}
      readOnly
      // css={{
      //   display: 'block',
      // }}
    >
      {isAtomicInlineType(_block?.type!) ? (
        <AtomicHeader block={_block} readOnly>
          {renderTextToComponents({
            text: _block?.text!,
            escapeFn: renderText,
          })}
        </AtomicHeader>
      ) : (
        <TextComponent>
          {renderTextToComponents({
            text: _block?.text!,
            escapeFn: renderText,
          })}
        </TextComponent>
      )}
    </ElementView>
  ) : (
    <TitleElement
      text={block?.text.textValue ?? _blockRes.data!.text.textValue}
      attributes={{}}
    >
      {renderTextToComponents({
        text: block?.text ?? _blockRes.data!.text,
        escapeFn: renderText,
      })}
    </TitleElement>
  )
}

export const FlatBlocks = ({ page }: { page: Page }) => (
  <>
    {page.blocks.map((block, idx) => {
      const _previousBlockId = idx > 0 ? page.blocks[idx - 1]._id : null
      return (
        <FlatBlock
          index={idx}
          key={block._id}
          id={block._id}
          previousId={_previousBlockId}
          {...(dbRef.current instanceof CouchDb
            ? {
                block,
                previousBlock: _previousBlockId
                  ? page.blocks[_previousBlockId]
                  : null,
              }
            : {})}
        />
      )
    })}
  </>
)

export const FlatPageBody = ({ page }: { page: Page }) => {
  const _couchMode = dbRef.current instanceof CouchDb
  const _pageRes = useDocument<Page>(page._id, {
    enabled: !_couchMode,
  })
  if (!_couchMode && !_pageRes.isSuccess) {
    return null
  }

  return (
    <View
      css={
        styledCss({
          overflowY: 'auto',
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
          flexGrow: 1,
          flexShrink: 1,
          display: 'block',
          paddingLeft: 'em',
          paddingRight: 'medium',
          paddingBottom: 'extraLarge',
          ...scrollbarResetCss,
        }) as InterpolationWithTheme<any>
      }
    >
      <FlatBlocks page={_couchMode ? page : _pageRes.data!} />
    </View>
  )
}
function renderRawHtml(html: string) {
  return <RawHtml html={html} variant="bodyTextNormal" />
}

function renderText(html: string) {
  return (
    <RawHtml
      css={{
        display: 'inline',
        whiteSpace: 'break-spaces',
        color: 'inherit',
      }}
      variant="bodyTextNormal"
      html={html}
    />
  )
}

export interface Leaf {
  children: ReactNode
  embed: boolean
  inlineTopic: boolean
  atomicId: string | undefined
  text: string
  link: boolean
  inlineCitation: boolean
  italic: boolean
  bold: boolean
  location: boolean
  url?: string
  highlight?: boolean
}

export function rangeToLeaf(marks: Mark[], text: string) {
  const _atomicId: string | undefined = marks.find((m) => Array.isArray(m))?.[1]
  const _includesInline = (_marks: Mark[], inlineType: InlineTypes) =>
    !!_marks.find((m) => Array.isArray(m) && m[0] === inlineType)

  const _leaf: Leaf = {
    text,
    children: renderText(text),
    atomicId: _atomicId,
    embed: _includesInline(marks, InlineTypes.Embed),
    inlineTopic: _includesInline(marks, InlineTypes.InlineTopic),
    inlineCitation: _includesInline(marks, InlineTypes.InlineSource),
    link: _includesInline(marks, InlineTypes.Link),
    italic: marks.includes(RangeType.Italic),
    bold: marks.includes(RangeType.Bold),
    location: marks.includes(RangeType.Location),
  }

  return _leaf
}

/**
 * Renders Text using Editor Components
 * NB this assumes that ranges do not overlap
 */
export function renderTextToComponents({
  text,
  linkedDocs,
  escapeFn = (_s: string) => _s,
}: {
  text: Text
  linkedDocs?: DocumentDict<Document>
  escapeFn?: (_s: string) => ReactNode
}): ReactNode {
  let _text = text.textValue

  if (!text.ranges.length) {
    return escapeFn(_text)
  }

  // merge and sort ranges
  const _ranges = mergeRanges(text.ranges, SortOptions.Ascending)
  console.log('[FlatPageBody] ranges', _ranges)

  let _lastRangeEnd = 0

  return (
    <>
      {_ranges.reduce((_components: ReactNode[], _range) => {
        const _before = _text.slice(_lastRangeEnd, _range.offset)
        const _segment = _text.slice(
          _range.offset,
          _range.offset + _range.length
        )
        _lastRangeEnd = _range.offset + _range.length
        return _components.concat([
          escapeFn(_before),
          <LeafComponent
            readOnly
            attributes={{}}
            leaf={rangeToLeaf(_range.marks, _segment)}
          >
            {escapeFn(_segment)}
          </LeafComponent>,
        ])
      }, [])}
      {_lastRangeEnd < _text.length - 1
        ? escapeFn(_text.slice(_lastRangeEnd))
        : null}
    </>
  )

  // _ranges.forEach((_range) => {
  //   // split text into _before, _segment and _after
  //   const _before = _text.slice(0, _range.offset)
  //   let _segment = _text.slice(_range.offset, _range.offset + _range.length)
  //   const _after = _text.slice(_range.offset + _range.length)

  //   // EDGE CASE: if segment is just whitespace an has marks, just return the whitespace
  //   if (!_segment.match(/[^\s]/)) {
  //     _text = `${_before}${_segment}${_after}`
  //     return
  //   }

  //   // ignore marks with no defined markup
  //   try {
  //     let _openTags = ''
  //     let _closeTags = ''
  //     _range.marks.forEach((_mark) => {
  //       // mark can be a tuple or string; coerce to tuple
  //       const __mark: string[] = Array.isArray(_mark) ? _mark : [_mark]
  //       const [__open, __close, __transform] = tagMapFn(
  //         __mark,
  //         linkedDocs ?? {}
  //       )
  //       _openTags += typeof __open === 'function' ? __open(_segment) : __open
  //       _closeTags = `${
  //         typeof __close === 'function' ? __close(_segment) : __close
  //       }${_closeTags}`
  //       if (__transform) {
  //         _segment = (__transform as StringTransformFn)(_segment)
  //       }
  //       _segment = escapeFn(_segment)
  //     })
  //     _text = `${_before}${_openTags}${_segment}${_closeTags}${_after}`
  //   } catch (err) {
  //     console.warn('[renderText]', err)
  //     _text = `${_before}${_segment}${_after}`
  //   }
  // })
  // return _text
}
