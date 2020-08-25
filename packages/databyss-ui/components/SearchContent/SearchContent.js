import React from 'react'
import { useParams, Router } from '@reach/router'
import { EntrySearchLoader } from '@databyss-org/ui/components/Loaders'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import {
  SearchResultsContainer,
  SearchResultTitle,
  SearchResultDetails,
} from '@databyss-org/ui/components/SearchContent/SearchResults'
import { Text, View, ScrollView, RawHtml } from '@databyss-org/ui/primitives'

import { slateBlockToHtmlWithSearch } from '@databyss-org/editor/lib/util'

export const SearchRouter = () => (
  <Router>
    <SearchContent path=":query" />
  </Router>
)

const SearchContent = () => {
  const { navigate } = useNavigationContext()
  const { query } = useParams()

  const onEntryClick = (pageId, blockId) => {
    navigate(`/pages/${pageId}#${blockId}`)
  }

  const onPageClick = pageId => {
    navigate(`/pages/${pageId}`)
  }

  const ComposeResults = ({ results }) => {
    const _Pages = Object.values(results).length ? (
      Object.values(results).map((r, i) => (
        <SearchResultsContainer key={i}>
          <SearchResultTitle
            onPress={() => onPageClick(r.pageId)}
            text={r.page}
            icon={<PageSvg />}
            dataTestElement="search-result-page"
          />

          {r.entries.map((e, k) => (
            <SearchResultDetails
              key={k}
              dataTestElement="search-result-entries"
              onPress={() => onEntryClick(r.pageId, e.entryId)}
              text={
                <RawHtml
                  html={slateBlockToHtmlWithSearch(
                    { text: e.text, type: 'ENTRY' },
                    query
                  )}
                />
              }
            />
          ))}
        </SearchResultsContainer>
      ))
    ) : (
      <Text>no results found</Text>
    )
    return <View px="medium">{_Pages}</View>
  }

  return (
    <ScrollView p="medium" flex="1" maxHeight="98vh">
      <View p="medium">
        <Text variant="bodyHeading1" color="text.3">
          &quot;{query}&quot;
        </Text>
      </View>
      <EntrySearchLoader query={query}>
        {results => ComposeResults(results)}
      </EntrySearchLoader>
    </ScrollView>
  )
}

export default SearchContent
