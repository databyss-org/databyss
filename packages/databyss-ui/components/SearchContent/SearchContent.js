import React from 'react'
import { Helmet } from 'react-helmet'
import {
  useParams,
  Router,
} from '@databyss-org/ui/components/Navigation/NavigationProvider'
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
import { StickyHeader } from '../Navigation/SickyHeader'
import { PageContentView } from '../PageContent/PageContent'

const SearchContent = () => {
  const { navigate } = useNavigationContext()
  const { query } = useParams()

  const _query = decodeURIComponent(query)

  const onEntryClick = (pageId, blockId) => {
    navigate(`/pages/${pageId}#${blockId}`)
  }

  const onPageClick = (pageId) => {
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
                    // only allow alphanumeric, hyphen and space
                    _query.replace(/[^a-zA-Z0-9À-ž-' ]/gi, '')
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
    return _Pages
  }

  return (
    <>
      <StickyHeader path={['Search in text', _query]} />
      <Helmet>
        <meta charSet="utf-8" />
        <title>{_query}</title>
      </Helmet>
      <PageContentView ml="medium">
        <View pb="medium">
          <Text variant="bodyHeading1" color="text.3">
            &quot;{_query}&quot;
          </Text>
        </View>
        <EntrySearchLoader query={_query}>
          {(results) => ComposeResults(results)}
        </EntrySearchLoader>
      </PageContentView>
    </>
  )
}

export const SearchRouter = () => (
  <Router>
    <SearchContent path=":query" />
  </Router>
)

export default SearchContent
