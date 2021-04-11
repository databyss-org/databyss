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
import { useBlockRelations, usePages } from '@databyss-org/data/pouchdb/hooks'
import { BlockType } from '@databyss-org/editor/interfaces'
import { groupBlockRelationsByPage } from '@databyss-org/services/blocks'
import { addPagesToBlockRelation } from '@databyss-org/services/blocks/joins'
import { Block, DocumentDict, Page } from '@databyss-org/services/interfaces'

interface IndexResultsProps {
  blockType: BlockType
  relatedBlockId: string
  blocks: DocumentDict<Block>
  pages: DocumentDict<Page>
}

export const IndexResults = ({
  blockType,
  relatedBlockId,
  blocks,
  pages,
}: IndexResultsProps) => {
  // console.log('[IndexResults] pages', pages)
  const { getAccountFromLocation } = useNavigationContext()
  const blockRelationRes = useBlockRelations(blockType, {
    _id: `r_${relatedBlockId}`,
  })

  const queryRes = [blockRelationRes]

  if (queryRes.some((q) => !q.isSuccess)) {
    return <LoadingFallback queryObserver={queryRes} />
  }

  const _blockRelation = blockRelationRes.data![`r_${relatedBlockId}`]
  // console.log('[IndexResults] pages', pages)

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
          .map((e, k) => (
            <IndexResultDetails
              key={k}
              href={`/${getAccountFromLocation()}/pages/${r}#${e.block}`}
              text={
                <RawHtml html={slateBlockToHtmlWithSearch(blocks[e.block])} />
              }
              dataTestElement="atomic-result-item"
            />
          ))}
      </IndexResultsContainer>
    ))

  return <>{_results}</>
}
