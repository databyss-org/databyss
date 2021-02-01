import React from 'react'
import { Helmet } from 'react-helmet'
import { useParams } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { EntrySearchLoader } from '@databyss-org/ui/components/Loaders'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import { Text, View, RawHtml } from '@databyss-org/ui/primitives'
import { slateBlockToHtmlWithSearch } from '@databyss-org/editor/lib/util'
import { StickyHeader } from '@databyss-org/ui/components/Navigation/SickyHeader'
import { PageContentView } from '@databyss-org/ui/components/PageContent/PageContent'
import {
  IndexResultsContainer,
  IndexResultTitle,
  IndexResultDetails,
} from '@databyss-org/ui/components'

export const SearchContent = () => {
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
        <IndexResultsContainer key={i}>
          <IndexResultTitle
            onPress={() => onPageClick(r.pageId)}
            text={r.page}
            icon={<PageSvg />}
            dataTestElement="search-result-page"
          />

          {r.entries.map((e, k) => (
            <IndexResultDetails
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
        </IndexResultsContainer>
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
