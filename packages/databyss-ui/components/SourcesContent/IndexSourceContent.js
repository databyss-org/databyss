import React from 'react'
import { View } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import {
  SearchResultsContainer,
  SearchResultTitle,
  SearchResultDetails,
} from '@databyss-org/ui/components/SearchContent/SearchResults'

const IndexSourceContent = ({ relations }) => {
  const { getPages } = usePageContext()
  const { navigate } = useNavigationContext()

  const pages = getPages()

  const onPageClick = pageId => {
    navigate(`/pages/${pageId}`)
  }

  const onEntryClick = (pageId, entryId) => {
    navigate(`/pages/${pageId}#${entryId}`)
  }

  const _results = Object.keys(relations.results)
    // filter out results not associated to a page
    // page may have been archived
    .filter(r => pages[r]?.name)
    .map((r, i) => (
      <SearchResultsContainer key={i}>
        <SearchResultTitle
          key={`pageHeader-${i}`}
          onPress={() => onPageClick(r)}
          icon={<PageSvg />}
          text={pages[r].name}
          dataTestElement="atomic-results"
        />

        {relations.results[r].map((e, k) => (
          <SearchResultDetails
            key={k}
            onPress={() => onEntryClick(r, e.blockId)}
            text={e.blockText.textValue}
            dataTestElement="atomic-result-item"
          />
        ))}
      </SearchResultsContainer>
    ))
  return <View px="medium">{_results}</View>
}

export default IndexSourceContent
