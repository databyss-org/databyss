import React, { ReactNode } from 'react'
import styledCss from '@styled-system/css'
import {
  createHighlightRanges,
  createLinkRangesForUrls,
  getInlineAtomicHref,
  InlineAtomicDef,
  isAtomicInlineType,
} from '@databyss-org/editor/lib/util'
import { Page, Text, RangeType, Block } from '@databyss-org/services/interfaces'
import cloneDeep from 'clone-deep'
import { RawHtml, View, Text as TextComponent } from '@databyss-org/ui'
import { scrollbarResetCss } from '@databyss-org/ui/primitives/View/View'
import { ElementView } from '@databyss-org/editor/components/ElementView'
import { InterpolationWithTheme } from '@emotion/core'
import { mergeRanges, SortOptions } from '@databyss-org/services/blocks'
import { InlineTypes, Mark } from '@databyss-org/services/interfaces/Range'
import { Leaf as LeafComponent } from '@databyss-org/editor/components/Leaf'
import { TitleElement } from '@databyss-org/editor/components/TitleElement'
import { useDocument } from '@databyss-org/data/pouchdb/hooks/useDocument'
import { dbRef } from '@databyss-org/data/pouchdb/db'
import { CouchDb } from '@databyss-org/data/couchdb-client/couchdb'
import { AtomicHeader } from '@databyss-org/editor/components/AtomicHeader'
import { splitOverlappingRanges } from '@databyss-org/services/blocks/textRanges'
import { useSearchContext } from '../../hooks'
import { useNavigationContext } from '../Navigation'

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
  let _searchTerm = useSearchContext((c) => c && c.searchTerm)
  const navigate = useNavigationContext((c) => c && c.navigate)
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

  _searchTerm = _searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
  const _renderText = () =>
    renderTextToComponents({
      key: block?._id!,
      text: _block?.text!,
      escapeFn: renderText,
      searchTerm: _searchTerm,
      onInlineClick: (d) => navigate(getInlineAtomicHref(d)),
    })

  return index ? (
    <ElementView
      block={_block}
      previousBlock={previousBlock ?? _previousBlockRes.data ?? null}
      readOnly
    >
      {isAtomicInlineType(_block?.type!) ? (
        <AtomicHeader block={_block!} readOnly>
          {_renderText()}
        </AtomicHeader>
      ) : (
        <TextComponent>{_renderText()}</TextComponent>
      )}
    </ElementView>
  ) : (
    <TitleElement
      text={block?.text.textValue ?? _blockRes.data!.text.textValue}
      attributes={{}}
    >
      {_renderText()}
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

function renderText(html: string, key?: string) {
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
  searchTerm,
  onInlineClick,
  escapeFn = (_s: string) => _s,
}: {
  key: string
  text: Text
  searchTerm?: string
  onInlineClick: (d: InlineAtomicDef) => void
  escapeFn?: (_s: string, _key?: string) => ReactNode
}): ReactNode {
  const _text = text.textValue
  let _ranges = cloneDeep(text.ranges)

  // add link ranges
  _ranges = _ranges.concat(createLinkRangesForUrls(_text))

  if (searchTerm) {
    _ranges = _ranges.concat(createHighlightRanges(_text, searchTerm))
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
