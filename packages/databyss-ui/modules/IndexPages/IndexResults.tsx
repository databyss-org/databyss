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
import { Block } from '@databyss-org/services/interfaces'
import { addPagesToBlockRelation } from '@databyss-org/services/blocks/joins'
import { useDocuments } from '@databyss-org/data/pouchdb/hooks/useDocuments'
import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'

interface IndexResultsProps {
  blockType: BlockType
  relatedBlockId: string
}

export const IndexResults = ({
  blockType,
  relatedBlockId,
}: IndexResultsProps) => {
  const { getAccountFromLocation } = useNavigationContext()
  const blockRelationRes = useBlockRelations(blockType, {
    _id: `r_${relatedBlockId}`,
  })

  // returns all blocks
  const _blocksRes = useDocuments<Block>(['blocks'], {
    $type: DocumentType.Block,
  })

  const pagesRes = usePages()
  const queryRes = [blockRelationRes, pagesRes, _blocksRes]

  if (queryRes.some((q) => !q.isSuccess)) {
    return <LoadingFallback queryObserver={queryRes} />
  }

  const _relations = addPagesToBlockRelation({
    blockRelation: blockRelationRes.data![`r_${relatedBlockId}`],
    pages: pagesRes.data!,
    blocks: _blocksRes.data!,
  }).filter((r) => r.relatedBlock === relatedBlockId)

  const groupedRelations = groupBlockRelationsByPage(_relations)

  const _results = Object.keys(groupedRelations)
    // filter out results for archived and missing pages
    .filter((r) => pagesRes.data![r] && !pagesRes.data![r].archive)
    // filter out results if no entries are included
    .filter((r) => groupedRelations[r].length)
    .map((r, i) => (
      <IndexResultsContainer key={i}>
        <IndexResultTitle
          key={`pageHeader-${i}`}
          href={`/${getAccountFromLocation()}/pages/${r}`}
          icon={<PageSvg />}
          text={pagesRes.data![r].name}
          dataTestElement="atomic-results"
        />

        {groupedRelations[r]
          .filter((e) => e.blockText.textValue.length)
          .map((e, k) => (
            <IndexResultDetails
              key={k}
              href={`/${getAccountFromLocation()}/pages/${r}#${e.block}`}
              text={
                <RawHtml
                  html={slateBlockToHtmlWithSearch(_blocksRes.data![e.block])}
                />
              }
              dataTestElement="atomic-result-item"
            />
          ))}
      </IndexResultsContainer>
    ))

  return <>{_results}</>
}
