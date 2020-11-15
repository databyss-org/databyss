import React from 'react'
import { View, RawHtml } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import {
  SearchResultsContainer,
  SearchResultTitle,
  SearchResultDetails,
} from '@databyss-org/ui/components/SearchContent/SearchResults'
import { slateBlockToHtmlWithSearch } from '@databyss-org/editor/lib/util'

const IndexSourceContent = ({ relations }) => {
  const { getPages } = usePageContext()
  const { navigate } = useNavigationContext()

  const pages = getPages()

  const onPageClick = pageId => {
    // if topic has no blocks associated with it, page click should instead redirect to the topic in the page
    if (
      relations.results[pageId].length === 1 &&
      !relations.results[pageId][0].blockText.textValue.length
    ) {
      const _blockId = relations.results[pageId][0].relatedBlock
      navigate(`/pages/${pageId}#${_blockId}`)
    } else {
      navigate(`/pages/${pageId}`)
    }
  }

  const onEntryClick = (pageId, entryId) => {
    navigate(`/pages/${pageId}#${entryId}`)
  }

  const _results = Object.keys(relations.results)
    // filter out results not associated to a page
    // page may have been archived
    .filter(r => pages[r]?.name)
    // filter out results if no entries are included
    .filter(r => relations.results[r].length)
    .map((r, i) => (
      <SearchResultsContainer key={i}>
        <SearchResultTitle
          key={`pageHeader-${i}`}
          onPress={() => onPageClick(r)}
          icon={<PageSvg />}
          text={pages[r].name}
          dataTestElement="atomic-results"
        />

        {relations.results[r]
          .filter(e => e.blockText.textValue.length)
          .map((e, k) => (
            <SearchResultDetails
              key={k}
              onPress={() => onEntryClick(r, e.block)}
              text={
                <RawHtml
                  html={slateBlockToHtmlWithSearch({
                    text: e.blockText,
                    type: 'ENTRY',
                  })}
                />
              }
              dataTestElement="atomic-result-item"
            />
          ))}
      </SearchResultsContainer>
    ))

  return <View px="medium">{_results}</View>
}

export default IndexSourceContent
