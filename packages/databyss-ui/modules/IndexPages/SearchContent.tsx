import React from 'react'
import { useParams } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { EntrySearchLoader } from '@databyss-org/ui/components/Loaders'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import { Text, RawHtml } from '@databyss-org/ui/primitives'
import { slateBlockToHtmlWithSearch } from '@databyss-org/editor/lib/util'
import {
  IndexResultsContainer,
  IndexResultTitle,
  IndexResultDetails,
} from '@databyss-org/ui/components'
import { IndexPageView } from './IndexPageContent'

export const SearchContent = () => {
  const { getAccountFromLocation } = useNavigationContext()
  const { query } = useParams()

  const _query = decodeURIComponent(query)

  const ComposeResults = ({ results }) => {
    const _Pages = Object.values(results).length ? (
      Object.values(results).map((r, i) => (
        <IndexResultsContainer key={i}>
          <IndexResultTitle
            href={`/${getAccountFromLocation()}/pages/${r.pageId}`}
            text={r.page}
            icon={<PageSvg />}
            dataTestElement="search-result-page"
          />

          {r.entries.map((e, k) => (
            <IndexResultDetails
              key={k}
              dataTestElement="search-result-entries"
              href={`/${getAccountFromLocation()}/pages/${r.pageId}#${
                e.entryId
              }`}
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
    <IndexPageView path={['Search', _query]}>
      <EntrySearchLoader query={_query}>
        {(results) => ComposeResults(results)}
      </EntrySearchLoader>
    </IndexPageView>
  )
}
