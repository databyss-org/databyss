import React from 'react'
import { BaseControl, RawHtml, Text, View } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import BlockSvg from '@databyss-org/ui/assets/arrowRight.svg'
import {
  IndexResultsContainer,
  IndexResultTitle,
  IndexResultDetails,
  LoadingFallback,
} from '@databyss-org/ui/components'
import {
  getBlockPrefix,
  getInlineAtomicHref,
  slateBlockToHtmlWithSearch,
} from '@databyss-org/editor/lib/util'
import { groupBlockRelationsByPage } from '@databyss-org/services/blocks'
import { addPagesToBlockRelation } from '@databyss-org/services/blocks/joins'
import {
  Block,
  BlockRelation,
  BlockType,
  DocumentDict,
  Page,
  Source,
} from '@databyss-org/services/interfaces'
import { urlSafeName } from '@databyss-org/services/lib/util'
import { useDocument } from '../../../databyss-data/pouchdb/hooks/useDocument'
import { useSearchContext } from '../../hooks'

interface IndexResultsProps {
  relatedBlockId: string
  blocks: DocumentDict<Block>
  pages: DocumentDict<Page>
}

/*
.map((hr) => {
                    const _type = blocks[hr.relatedBlock].type
                    const _prefix = getBlockPrefix(_type)
                    const _text = {
                      [BlockType.Topic]: blocks[hr.relatedBlock].text.textValue,
                      [BlockType.Source]: (blocks[hr.relatedBlock] as Source)
                        .name?.textValue,
                    }[_type]
                    return _prefix + _text
                  })
                  */

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
}: IndexResultsProps) => {
  const { getAccountFromLocation, navigate } = useNavigationContext()
  const blockRelationRes = useDocument<BlockRelation>(`r_${relatedBlockId}`)
  const normalizedStemmedTerms = useSearchContext(
    (c) => c && c.normalizedStemmedTerms
  )

  const queryRes = [blockRelationRes]

  if (queryRes.some((q) => !q.isSuccess)) {
    return <LoadingFallback queryObserver={queryRes} />
  }

  const _blockRelation = blockRelationRes.data!

  const _relations = addPagesToBlockRelation({
    blockRelation: _blockRelation,
    pages,
    blocks,
  }).filter((r) => r.relatedBlock === relatedBlockId)

  const groupedRelations = groupBlockRelationsByPage(_relations)

  const _results = Object.keys(groupedRelations)
    // filter out results for archived and missing pages
    .filter((r) => pages[r] && !pages[r].archive)
    // filter out results if no entries are included
    .filter((r) => groupedRelations[r].length)
    .map((r, i) => (
      <IndexResultsContainer key={i}>
        <IndexResultTitle
          key={`pageHeader-${i}`}
          href={`/${getAccountFromLocation(true)}/pages/${r}/${urlSafeName(
            pages[r].name
          )}`}
          icon={<PageSvg />}
          text={pages[r].name}
          dataTestElement="atomic-results"
        />

        {groupedRelations[r]
          .filter((e) => e.blockText.textValue.length)
          .map((e, k) => {
            const _variant = {
              [BlockType.Topic]: 'bodyNormalSemibold',
              [BlockType.Source]: 'bodyNormalUnderline',
            }[blocks[e.block].type]
            const _anchor = e.blockIndex

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
            return (
              <IndexResultDetails
                key={k}
                href={`/${getAccountFromLocation(
                  true
                )}/pages/${r}/${urlSafeName(pages[r].name)}#${_anchor}`}
                block={blocks[e.block]}
                normalizedStemmedTerms={normalizedStemmedTerms}
                onInlineClick={(d) => navigate(getInlineAtomicHref(d))}
                icon={<BlockSvg />}
                tags={<IndexResultTags tags={_extraTags} />}
                dataTestElement="atomic-result-item"
              />
            )
          })}
      </IndexResultsContainer>
    ))

  return <>{_results}</>
}
