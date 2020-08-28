import React from 'react'
import { useParams, Router } from '@reach/router'
import { EntrySearchLoader } from '@databyss-org/ui/components/Loaders'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import {
  Text,
  View,
  BaseControl,
  Grid,
  Icon,
  ScrollView,
  RawHtml,
} from '@databyss-org/ui/primitives'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import { slateBlockToHtmlWithSearch } from '@databyss-org/editor/lib/util'

export const SearchRouter = () => (
  <Router>
    <SearchContent path=":query" />
  </Router>
)

const SearchContent = () => {
  const { getCurrentAccount } = useSessionContext()
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
        <View key={i} mb="medium">
          <View height="40px">
            <BaseControl
              data-test-element="search-result-page"
              hoverColor="background.2"
              activeColor="background.3"
              key={`pageHeader-${i}`}
              onClick={() => onPageClick(r.pageId)}
            >
              <Grid singleRow alignItems="center" columnGap="small">
                <Icon sizeVariant="small" color="text.3">
                  <PageSvg />
                </Icon>
                <Text variant="bodyHeading3">{r.page}</Text>
              </Grid>
            </BaseControl>
          </View>
          {r.entries.map((e, k) => (
            <BaseControl
              data-test-element="search-result-entries"
              hoverColor="background.2"
              activeColor="background.3"
              key={k}
              onClick={() => onEntryClick(r.pageId, e.entryId)}
            >
              <View p="small" ml="small">
                <Text>
                  <RawHtml
                    html={slateBlockToHtmlWithSearch(
                      { text: e.text, type: 'ENTRY' },
                      query
                    )}
                  />
                </Text>
              </View>
            </BaseControl>
          ))}
        </View>
      ))
    ) : (
      <Text>no results found</Text>
    )
    return <View>{_Pages}</View>
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
