import React from 'react'
import { RawHtml, Text, View } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import {
  IndexResultsContainer,
  IndexResultTitle,
  IndexResultDetails,
  LoadingFallback,
} from '@databyss-org/ui/components'
import {
  getBlockPrefix,
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

interface IndexResultsProps {
  relatedBlockId: string
  blocks: DocumentDict<Block>
  pages: DocumentDict<Page>
}

export const IndexResultTags = ({ tags }: { tags: string[] }) => (
  <View flexDirection="row" flexWrap="wrap">
    {tags
      .sort((_tagText) => (_tagText.startsWith('#') ? -1 : 1))
      .map((_tagText, _idx) => (
        <Text
          variant="uiTextSmall"
          key={_idx}
          color={_tagText.startsWith('#') ? 'inlineTopic' : 'inlineSource'}
        >
          {_tagText}
          {_idx < tags.length - 1 ? ',' : ''}&nbsp;
        </Text>
      ))}
  </View>
)

export const IndexResults = ({
  relatedBlockId,
  blocks,
  pages,
}: IndexResultsProps) => {
  const { getAccountFromLocation } = useNavigationContext()
  const blockRelationRes = useDocument<BlockRelation>(`r_${relatedBlockId}`)

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
            let _anchor = e.block
            if (blocks[e.block].type !== BlockType.Entry) {
              _anchor += `/${e.blockIndex}`
            }

            // build extra tags
            const _extraTags: string[] = []
            if (
              blocks[e.block].type === BlockType.Entry &&
              e.activeHeadings?.length
            ) {
              _extraTags.push(
                ...e.activeHeadings
                  .filter((hr) => hr.relatedBlock !== relatedBlockId)
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
              )
            }
            return (
              <IndexResultDetails
                key={k}
                href={`/${getAccountFromLocation(
                  true
                )}/pages/${r}/${urlSafeName(pages[r].name)}#${_anchor}`}
                text={
                  <>
                    <RawHtml
                      html={slateBlockToHtmlWithSearch(blocks[e.block])}
                      variant={_variant}
                      mr="tiny"
                    />
                    <IndexResultTags tags={_extraTags} />
                  </>
                }
                dataTestElement="atomic-result-item"
              />
            )
          })}
      </IndexResultsContainer>
    ))

  return <>{_results}</>
}
