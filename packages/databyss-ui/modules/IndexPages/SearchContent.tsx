import React from 'react'
import { useParams } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import { Text, RawHtml } from '@databyss-org/ui/primitives'
import { slateBlockToHtmlWithSearch } from '@databyss-org/editor/lib/util'
import {
  IndexResultsContainer,
  IndexResultTitle,
  IndexResultDetails,
  LoadingFallback,
} from '@databyss-org/ui/components'
import { useSearchEntries } from '@databyss-org/data/pouchdb/hooks'
import { BlockType } from '@databyss-org/editor/interfaces'
import { SearchEntriesResultPage } from '@databyss-org/data/pouchdb/entries/lib/searchEntries'
import { IndexPageView } from './IndexPageContent'

export const SearchContent = () => {
  const { getAccountFromLocation } = useNavigationContext()
  const searchQuery = decodeURIComponent(useParams().query)
  const searchRes = useSearchEntries(searchQuery)

  const composeResults = (results: SearchEntriesResultPage[]) => {
    const _Pages = results.length ? (
      Object.values(results).map((r, i) => (
        <IndexResultsContainer key={i}>
          <IndexResultTitle
            href={`/${getAccountFromLocation()}/pages/${r.pageId}`}
            text={r.pageName}
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
                    { text: e.text, type: BlockType.Entry, _id: e.entryId },
                    // only allow alphanumeric, hyphen and space
                    searchQuery.replace(/[^a-zA-Z0-9À-ž-' ]/gi, '')
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
    <IndexPageView path={['Search', searchQuery]}>
      {searchRes.isSuccess ? (
        composeResults(searchRes.data)
      ) : (
        <LoadingFallback
          queryObserver={searchRes}
          showLongWaitMessage
          longWaitMs={5000}
          longWaitDialogOptions={{
            message:
              "<strong>⏳ Databyss is still building your search index, which may take a while but will allow fast searching once it's done.</strong>",
            html: true,
            showConfirmButtons: true,
          }}
        />
      )}
    </IndexPageView>
  )
}
