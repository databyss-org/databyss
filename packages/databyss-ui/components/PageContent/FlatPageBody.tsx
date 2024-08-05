import React, { forwardRef, ReactChildren, ReactNode, useRef } from 'react'
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
  Source,
} from '@databyss-org/services/interfaces'
import cloneDeep from 'clone-deep'
import { RawHtml, View, Text as TextComponent } from '@databyss-org/ui'
import { scrollbarResetCss } from '@databyss-org/ui/primitives/View/View'
import { ElementView } from '@databyss-org/editor/components/ElementView'
import { InterpolationWithTheme } from '@emotion/core'
import {
  mergeRanges,
  SortOptions,
  textToHtml,
} from '@databyss-org/services/blocks'
import { InlineTypes, Mark } from '@databyss-org/services/interfaces/Range'
import { Leaf as LeafComponent } from '@databyss-org/editor/components/Leaf'
import { TitleElement } from '@databyss-org/editor/components/TitleElement'
import { useDocument } from '@databyss-org/data/pouchdb/hooks/useDocument'
import { SearchTerm } from '@databyss-org/data/couchdb/couchdb'
import {
  AtomicHeader,
  isAtomicClosure,
} from '@databyss-org/editor/components/AtomicHeader'
import { splitOverlappingRanges } from '@databyss-org/services/blocks/textRanges'
import {
  atomicClosureText,
  atomicTypeToInlineRangeType,
} from '@databyss-org/editor/state/util'
import { useSearchContext } from '../../hooks'
import { useNavigationContext } from '../Navigation'
import { useScrollMemory } from '../../hooks/scrollMemory/useScrollMemory'
import forkRef from '../../lib/forkRef'
import {
  DbDocument,
  DocumentType,
  PageDoc,
} from '@databyss-org/data/pouchdb/interfaces'
import { inlineTypeToSymbol } from '@databyss-org/services/text/inlineUtils'
import { withTheme } from 'emotion-theming'
import { useEditorPageContext } from '@databyss-org/services'

export const FlatBlock = ({
  index,
  previousId,
  block,
  previousBlock,
  previousType,
  last,
  theme,
}: {
  index: number
  previousId: string | null
  previousType: BlockType | null
  block: Block
  previousBlock?: Block
  last: boolean
  theme: any
}) => {
  const normalizedStemmedTerms = useSearchContext(
    (c) => c && c.normalizedStemmedTerms
  )
  const setLastBlockRendered = useEditorPageContext(
    (c) => c && c.setLastBlockRendered
  )
  const navigate = useNavigationContext((c) => c && c.navigate)
  const _blockRes = useDocument<Block>(
    block._id,
    block.text?.textValue
      ? {
          initialData: block,
        }
      : {}
  )
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
  // console.log('[FlatBlock]', block._id, _blockRes.data)
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
      theme,
    })

  return index ? (
    <ElementView
      block={_block}
      previousBlock={_previousBlock}
      index={index}
      last={last}
      readOnly
      setLastBlockRendered={setLastBlockRendered}
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
  theme,
}: {
  page: Page
  onLast: () => void
  theme: any
}) => {
  const _blockIdDict: { [id: string]: number } = {}
  return (
    <>
      {page.blocks.map((block, idx) => {
        const _previousBlockId = idx > 0 ? page.blocks[idx - 1]._id : null
        const _previousBlockType = idx > 0 ? page.blocks[idx - 1].type : null
        const _last = idx === page.blocks.length - 1
        if (_last) {
          onLast()
        }
        if (!_blockIdDict[block._id]) {
          _blockIdDict[block._id] = 0
        }
        const _key = `${block._id}:${_blockIdDict[block._id]}`
        _blockIdDict[block._id] += 1
        return (
          <FlatBlock
            index={idx}
            last={_last}
            key={_key}
            previousId={_previousBlockId}
            previousType={_previousBlockType}
            block={block}
            previousBlock={
              _previousBlockId ? page.blocks[_previousBlockId] : null
            }
            theme={theme}
          />
        )
      })}
    </>
  )
}

export const FlatPageBody = withTheme(
  forwardRef(({ page, theme }: { page: Page; theme: any }, ref) => {
    const _pageRes = useDocument<Page>(page._id, { initialData: page })
    const _viewRef = useRef<HTMLElement | null>(null)
    const _restoreScroll = useScrollMemory(_viewRef)
    if (!_pageRes.data) {
      return null
    }
    return (
      <View
        ref={forkRef(ref, _viewRef)}
        bg="background.1"
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
            // ...scrollbarResetCss,
            scrollbarColor: '#99999966 transparent',
          }) as InterpolationWithTheme<any>
        }
      >
        <FlatBlocks
          theme={theme}
          page={_pageRes.data}
          onLast={_restoreScroll}
        />
      </View>
    )
  })
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

export function BoundLeafComponent({
  children,
  leaf,
  escapeFn,
  childKey,
  searchTerms,
  theme,
  ...others
}: {
  leaf: Leaf
  children: ReactNode
  escapeFn: (_s: string, _key?: string) => ReactNode
  childKey: string | undefined
  searchTerms?: SearchTerm[]
  theme?: any
}) {
  const _docRes = useDocument<DbDocument>(leaf.atomicId!, {
    enabled: !!leaf.atomicId,
  })
  let _symbol = ''
  let _text = leaf.text
  let _leaf = leaf
  let _children = children
  if (_docRes.isSuccess && _docRes.data) {
    if (_docRes.data.doctype === DocumentType.Page) {
      _text = ((_docRes.data as unknown) as PageDoc).name
    } else {
      const _block: Block = (_docRes.data as unknown) as Block
      _symbol = inlineTypeToSymbol(atomicTypeToInlineRangeType(_block?.type))
      _text = `${_symbol}${_block?.text?.textValue}`
      if (_block.type === BlockType.Source) {
        _text = (_block as Source).name?.textValue ?? _text
      }
    }
    if (searchTerms) {
      // console.log('[FlatPageBody] highlightRanges', _text)
      let _highlightRanges = createHighlightRanges(_text, searchTerms)
      _highlightRanges = mergeRanges(_highlightRanges, SortOptions.Ascending)
      splitOverlappingRanges(_highlightRanges)
      _text = textToHtml(
        {
          textValue: _text,
          ranges: _highlightRanges,
        },
        theme
      )
      // console.log('[FlatPageBody] highlightRanges', _highlightRanges)
    }
    _leaf = {
      ...leaf,
      text: _text,
      children: renderText(_text),
    }
    _children = escapeFn(_text, childKey)
  }
  return (
    <LeafComponent leaf={_leaf} theme={theme} {...others}>
      {_children}
    </LeafComponent>
  )
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
  textOnly,
  bindAtomicId,
  theme,
}: {
  key: string
  text: Text
  searchTerms?: SearchTerm[]
  onInlineClick: (d: InlineAtomicDef) => void
  escapeFn?: (_s: string, _key?: string) => ReactNode
  textOnly?: boolean
  bindAtomicId?: string
  theme: any
}): ReactNode {
  if (!text) {
    return null
  }
  const _text = text.textValue
  let _ranges = cloneDeep(text.ranges)

  // add link ranges
  _ranges = _ranges.concat(createLinkRangesForUrls(_text))

  // collapse embed ranges
  _ranges
    .filter((_range) => _range.marks.find((m) => m[0] === 'embed'))
    .forEach((_embedRange) => {
      _embedRange.length = 0
    })

  if (searchTerms?.length && searchTerms[0].text?.length) {
    _ranges = _ranges.concat(
      createHighlightRanges(
        _text,
        searchTerms,
        bindAtomicId
          ? {
              currentRanges: _ranges,
              ignoreInlineId: bindAtomicId,
            }
          : undefined
      )
    )
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
        const _leaf = rangeToLeaf(_range.marks, _segment)
        const LEAF_COMPONENT =
          bindAtomicId && _leaf.atomicId === bindAtomicId
            ? BoundLeafComponent
            : LeafComponent
        return _components.concat([
          _before.length ? escapeFn(_before, `${key}.${_idx}b`) : null,
          <LEAF_COMPONENT
            key={`${key}.${_idx}`}
            readOnly
            textOnly={textOnly}
            attributes={{}}
            leaf={_leaf}
            onInlineClick={onInlineClick}
            escapeFn={escapeFn}
            searchTerms={searchTerms}
            childKey={_lastRangeEnd === _text.length ? `END_${key}` : undefined}
            theme={theme}
          >
            {escapeFn(
              _segment,
              _lastRangeEnd === _text.length - 1 ? `END_${key}` : undefined
            )}
          </LEAF_COMPONENT>,
        ])
      }, [])}
      {_lastRangeEnd < _text.length - 1
        ? escapeFn(_text.slice(_lastRangeEnd), `END_${key}`)
        : null}
    </>
  )
}
