// import React, { useMemo } from 'react'
import React from 'react'
import { BaseControl, Text, View } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import BlockSvg from '@databyss-org/ui/assets/arrowRight.svg'
import {
  IndexResultsContainer,
  IndexResultTitle,
  IndexResultDetails,
} from '@databyss-org/ui/components'
import {
  getBlockPrefix,
  getInlineAtomicHref,
} from '@databyss-org/editor/lib/util'
import { groupBlockRelationsByPage } from '@databyss-org/services/blocks'
import { addPagesToBlockRelation } from '@databyss-org/services/blocks/joins'
import {
  Block,
  BlockRelation,
  BlockType,
  DocumentDict,
  IndexPageResult,
  Page,
  Source,
} from '@databyss-org/services/interfaces'
import { urlSafeName } from '@databyss-org/services/lib/util'
// import { useDocument } from '../../../databyss-data/pouchdb/hooks/useDocument'
import { useSearchContext } from '../../hooks'

interface IndexResultsProps {
  relatedBlockId: string
  blocks: DocumentDict<Block>
  pages: DocumentDict<Page>
  onLast?: () => void
  textOnly?: boolean
  // pageBlockCount: number
  blockRelation: BlockRelation
}

export const IndexResultTags = ({ tags }: { tags: Block[] }) => (
  <View flexDirection="row" flexWrap="wrap" zIndex={5}>
    {tags
      .sort((_block) => (_block.type === BlockType.Topic ? -1 : 1))
      .map((_block, _idx) => {
        const _tagText = {
          [BlockType.Topic]: _block.text.textValue,
          [BlockType.Source]: (_block as Source).name?.textValue,
        }[_block.type]
        return (
          <BaseControl
            href={getInlineAtomicHref({
              atomicType: _block.type,
              id: _block._id,
              name: _tagText,
            })}
            key={_idx}
          >
            <Text
              variant="uiTextSmall"
              key={_idx}
              color={
                _block.type === BlockType.Topic ? 'inlineTopic' : 'inlineSource'
              }
            >
              {getBlockPrefix(_block.type)}
              {_tagText}
              {_idx < tags.length - 1 ? ',' : ''}&nbsp;
            </Text>
          </BaseControl>
        )
      })}
  </View>
)

export const IndexResults = ({
  relatedBlockId,
  blocks,
  pages,
  onLast,
  textOnly,
  // pageBlockCount,
  blockRelation,
}: IndexResultsProps) => {
  const { getAccountFromLocation, navigate } = useNavigationContext()
  // const blockRelationRes = useDocument<BlockRelation>(`r_${relatedBlockId}`)
  const normalizedStemmedTerms = useSearchContext(
    (c) => c && c.normalizedStemmedTerms
  )

  // return useMemo(() => {
  // console.log('[indexResults] blockRelations', blockRelation)
  const _relations = addPagesToBlockRelation({
    blockRelation,
    pages,
    blocks,
  }).filter((r) => r.relatedBlock === relatedBlockId)
  // console.log('[indexResults]', _relations)

  const groupedRelations = groupBlockRelationsByPage(_relations)

  const _filteredPages = Object.keys(groupedRelations)
    // filter out results for archived and missing pages
    .filter((r) => pages[r] && !pages[r].archive)
    // filter out results if no entries are included
    .filter((r) => groupedRelations[r].length)

  const _renderBlocks = (pageId, results: IndexPageResult[], isLastGroup) => {
    const _filteredBlocks = results.filter((e) => e.blockText.textValue.length)
    // console.log('[IndexResults] blocks', _filteredBlocks)
    return _filteredBlocks.map((e, eidx) => {
      if (!blocks[e.block]) {
        return null
      }
      const _variant = {
        [BlockType.Entry]: 'bodyNormal',
        [BlockType.Topic]: 'bodyNormalSemibold',
        [BlockType.Source]: 'bodyNormalUnderline',
      }[blocks[e.block].type]
      const _anchor = e.blockIndex
      // console.log('[IndexResults] block', e.block, blocks[e.block])
      // build extra tags
      const _extraTags: Block[] = []
      if (
        blocks[e.block].type === BlockType.Entry &&
        e.activeHeadings?.length
      ) {
        _extraTags.push(
          ...e.activeHeadings
            .filter((hr) => hr.relatedBlock !== relatedBlockId)
            .map((hr) => blocks[hr.relatedBlock])
        )
      }
      if (onLast && isLastGroup && eidx === _filteredBlocks.length - 1) {
        onLast()
      }
      return (
        <IndexResultDetails
          key={`${eidx}`}
          href={`/${getAccountFromLocation(true)}/pages/${pageId}/${urlSafeName(
            pages[pageId].name
          )}#${_anchor}`}
          block={blocks[e.block]}
          normalizedStemmedTerms={normalizedStemmedTerms}
          onInlineClick={(d) => navigate(getInlineAtomicHref(d))}
          icon={<BlockSvg />}
          tags={<IndexResultTags tags={_extraTags} />}
          textVariant={_variant}
          dataTestElement="atomic-result-item"
          textOnly={textOnly ?? false}
          bindAtomicId={relatedBlockId}
        />
      )
    })
  }

  const _results = _filteredPages.map((r, pidx) => (
    <IndexResultsContainer key={pidx}>
      <IndexResultTitle
        key={`pageHeader-${pidx}`}
        href={`/${getAccountFromLocation(true)}/pages/${r}/${urlSafeName(
          pages[r].name
        )}`}
        icon={<PageSvg />}
        text={pages[r].name}
        dataTestElement="atomic-results"
      />

      {_renderBlocks(
        r,
        groupedRelations[r],
        pidx === _filteredPages.length - 1
      )}
    </IndexResultsContainer>
  ))

  return <>{_results}</>
  // }, [
  //   relatedBlockId,
  //   blockRelationRes.data,
  //   blockRelationRes.data?.pages.length,
  //   Object.keys(blocks ?? {}).length,
  //   pageBlockCount,
  // ])
}
