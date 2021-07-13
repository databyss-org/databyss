import React from 'react'
import { RawHtml } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import {
  IndexResultsContainer,
  IndexResultTitle,
  IndexResultDetails,
  LoadingFallback,
} from '@databyss-org/ui/components'
import { slateBlockToHtmlWithSearch } from '@databyss-org/editor/lib/util'
import { groupBlockRelationsByPage } from '@databyss-org/services/blocks'
import { addPagesToBlockRelation } from '@databyss-org/services/blocks/joins'
import {
  Block,
  BlockRelation,
  BlockType,
  DocumentDict,
  Page,
} from '@databyss-org/services/interfaces'
import { useDocument } from '../../../databyss-data/pouchdb/hooks/useDocument'

interface IndexResultsProps {
  relatedBlockId: string
  blocks: DocumentDict<Block>
  pages: DocumentDict<Page>
}

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
          href={`/${getAccountFromLocation()}/pages/${r}`}
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
            return (
              <IndexResultDetails
                key={k}
                href={`/${getAccountFromLocation()}/pages/${r}#${_anchor}`}
                text={
                  <RawHtml
                    html={slateBlockToHtmlWithSearch(blocks[e.block])}
                    variant={_variant}
                  />
                }
                dataTestElement="atomic-result-item"
              />
            )
          })}
      </IndexResultsContainer>
    ))

  return <>{_results}</>
}
