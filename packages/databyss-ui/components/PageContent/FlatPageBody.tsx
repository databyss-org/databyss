import React, { forwardRef, ReactNode, useRef } from 'react'
import styledCss from '@styled-system/css'
import {
  createHighlightRanges,
  createLinkRangesForUrls,
  getInlineAtomicHref,
  InlineAtomicDef,
  isAtomicInlineType,
} from '@databyss-org/editor/lib/util'
import {
  Page,
  Text,
  RangeType,
  Block,
  BlockType,
} from '@databyss-org/services/interfaces'
import cloneDeep from 'clone-deep'
import {
  RawHtml,
  View,
  Text as TextComponent,
  RefForwardingFC,
} from '@databyss-org/ui'
import { scrollbarResetCss } from '@databyss-org/ui/primitives/View/View'
import { ElementView } from '@databyss-org/editor/components/ElementView'
import { InterpolationWithTheme } from '@emotion/core'
import { mergeRanges, SortOptions } from '@databyss-org/services/blocks'
import { InlineTypes, Mark } from '@databyss-org/services/interfaces/Range'
import { Leaf as LeafComponent } from '@databyss-org/editor/components/Leaf'
import { TitleElement } from '@databyss-org/editor/components/TitleElement'
import { useDocument } from '@databyss-org/data/pouchdb/hooks/useDocument'
import { SearchTerm } from '@databyss-org/data/couchdb-client/couchdb'
import {
  AtomicHeader,
  isAtomicClosure,
} from '@databyss-org/editor/components/AtomicHeader'
import { splitOverlappingRanges } from '@databyss-org/services/blocks/textRanges'
import { atomicClosureText } from '@databyss-org/editor/state/util'
import { useSearchContext } from '../../hooks'
import { useNavigationContext } from '../Navigation'
import { useScrollMemory } from '../../hooks/scrollMemory/useScrollMemory'
import forkRef from '../../lib/forkRef'

export const FlatBlock = ({
  index,
  previousId,
  block,
  previousBlock,
  previousType,
  last,
}: {
  index: number
  previousId: string | null
  previousType: BlockType | null
  block: Block
  previousBlock?: Block
  last: boolean
}) => {
  const normalizedStemmedTerms = useSearchContext(
    (c) => c && c.normalizedStemmedTerms
  )
  const navigate = useNavigationContext((c) => c && c.navigate)
  const _blockRes = useDocument<Block>(block._id, {
    initialData: block,
  })
  const _previousBlockRes = useDocument<Block>(previousId!, {
    initialData: previousBlock,
    enabled: !!previousId,
  })
  if (
    previousId &&
    !isAtomicClosure(previousType) &&
    !_previousBlockRes.isSuccess
  ) {
    return null
  }
  if (!_blockRes.data?.text) {
    return null
  }
  const _block = isAtomicClosure(block.type) ? { ...block } : _blockRes.data!
  if (isAtomicClosure(_block.type)) {
    _block.text = {
      textValue: atomicClosureText(
        _block.type,
        _blockRes.data!.text?.textValue ?? _block.text.textValue
      ),
      ranges: [],
    }
  }

  const _previousBlock = isAtomicClosure(previousType)
    ? {
        _id: previousId ?? '',
        type: previousType ?? BlockType._ANY,
        text: { textValue: '', ranges: [] },
      }
    : _previousBlockRes.data ?? null

  const _renderText = () =>
    renderTextToComponents({
      key: _block._id,
      text: _block.text ?? { textValue: '', ranges: [] },
      escapeFn: renderText,
      searchTerms: normalizedStemmedTerms,
      onInlineClick: (d) => navigate(getInlineAtomicHref(d)),
    })

  return index ? (
    <ElementView
      block={_block}
      previousBlock={_previousBlock}
      index={index}
      last={last}
      readOnly
    >
      {isAtomicInlineType(_block.type) ? (
        <AtomicHeader block={_block} readOnly>
          {_renderText()}
        </AtomicHeader>
      ) : (
        <TextComponent>{_renderText()}</TextComponent>
      )}
    </ElementView>
  ) : (
    <TitleElement text={_block.text.textValue} attributes={{}}>
      {_renderText()}
    </TitleElement>
  )
}

export const FlatBlocks = ({
  page,
  onLast,
}: {
  page: Page
  onLast: () => void
}) => (
  <>
    {page.blocks.map((block, idx) => {
      const _previousBlockId = idx > 0 ? page.blocks[idx - 1]._id : null
      const _previousBlockType = idx > 0 ? page.blocks[idx - 1].type : null
      const _last = idx === page.blocks.length - 1
      if (_last) {
        onLast()
      }
      return (
        <FlatBlock
          index={idx}
          last={_last}
          key={`${idx}:${block._id}`}
          previousId={_previousBlockId}
          previousType={_previousBlockType}
          block={block}
          previousBlock={
            _previousBlockId ? page.blocks[_previousBlockId] : null
          }
        />
      )
    })}
  </>
)

export const FlatPageBody: RefForwardingFC<{ page: Page }> = forwardRef(
  ({ page }, ref) => {
    const _pageRes = useDocument<Page>(page._id, { initialData: page })
    const _viewRef = useRef<HTMLElement | null>(null)
    const _restoreScroll = useScrollMemory(_viewRef)
    if (!_pageRes.data) {
      return null
    }
    return (
      <View
        ref={forkRef(ref, _viewRef)}
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
        <FlatBlocks page={_pageRes.data} onLast={_restoreScroll} />
      </View>
    )
  }
)

export function renderText(html: string, key?: string) {
  let _html = html
  if (key?.startsWith('END') && !_html?.trim().length) {
    _html = '&nbsp;'
  } else if (key?.startsWith('END') && _html.endsWith('\n')) {
    _html += '&nbsp;'
  }
  return (
    <RawHtml
      css={{
        display: 'inline',
        whiteSpace: 'break-spaces',
        color: 'inherit',
      }}
      variant="bodyTextNormal"
      html={_html}
      {...(key ? { key } : {})}
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
  const _getInline = (inlineType: InlineTypes) =>
    marks.find((m) => Array.isArray(m) && m[0] === inlineType)
  const _includesInline = (inlineType: InlineTypes) => !!_getInline(inlineType)

  const _leaf: Leaf = {
    text,
    link: _includesInline(InlineTypes.Link),
    url: _getInline(InlineTypes.Url)?.[1],
    children: renderText(text),
    atomicId: _atomicId,
    embed: _includesInline(InlineTypes.Embed),
    inlineTopic: _includesInline(InlineTypes.InlineTopic),
    inlineCitation: _includesInline(InlineTypes.InlineSource),
    italic: marks.includes(RangeType.Italic),
    bold: marks.includes(RangeType.Bold),
    location: marks.includes(RangeType.Location),
    highlight: marks.includes(RangeType.Highlight),
  }

  return _leaf
}

/**
 * Renders Text using Editor Components
 * NB this assumes that ranges do not overlap
 */
export function renderTextToComponents({
  key,
  text,
  searchTerms,
  onInlineClick,
  escapeFn = (_s: string) => _s,
}: {
  key: string
  text: Text
  searchTerms?: SearchTerm[]
  onInlineClick: (d: InlineAtomicDef) => void
  escapeFn?: (_s: string, _key?: string) => ReactNode
}): ReactNode {
  if (!text) {
    return null
  }
  const _text = text.textValue
  let _ranges = cloneDeep(text.ranges)

  // add link ranges
  _ranges = _ranges.concat(createLinkRangesForUrls(_text))

  if (searchTerms) {
    _ranges = _ranges.concat(createHighlightRanges(_text, searchTerms))
  }

  if (!_ranges.length) {
    return escapeFn(_text, `END_${key}`)
  }

  // merge and sort ranges
  _ranges = mergeRanges(_ranges, SortOptions.Ascending)
  splitOverlappingRanges(_ranges)

  let _lastRangeEnd = 0

  return (
    <>
      {_ranges.reduce((_components: ReactNode[], _range, _idx) => {
        const _before = _text.slice(_lastRangeEnd, _range.offset)
        const _segment = _text.slice(
          _range.offset,
          _range.offset + _range.length
        )
        _lastRangeEnd = _range.offset + _range.length
        return _components.concat([
          _before.length ? escapeFn(_before, `${key}.${_idx}b`) : null,
          <LeafComponent
            key={`${key}.${_idx}`}
            readOnly
            attributes={{}}
            leaf={rangeToLeaf(_range.marks, _segment)}
            onInlineClick={onInlineClick}
          >
            {escapeFn(
              _segment,
              _lastRangeEnd === _text.length - 1 ? `END_${key}` : undefined
            )}
          </LeafComponent>,
        ])
      }, [])}
      {_lastRangeEnd < _text.length - 1
        ? escapeFn(_text.slice(_lastRangeEnd), `END_${key}`)
        : null}
    </>
  )
}
