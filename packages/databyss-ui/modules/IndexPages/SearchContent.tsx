import React from 'react'
import { useParams } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import { Text, RawHtml } from '@databyss-org/ui/primitives'
import {
  getBlockPrefix,
  slateBlockToHtmlWithSearch,
} from '@databyss-org/editor/lib/util'
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
import { IndexResultTags } from './IndexResults'

export const SearchContent = () => {
  const { getAccountFromLocation } = useNavigationContext()
  const searchQuery = decodeURIComponent(useParams().query!)
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

          {r.entries.map((e, k) => {
            if (e.index === 0) {
              return null
            }
            const _variant = {
              [BlockType.Topic]: 'bodyNormalSemibold',
              [BlockType.Source]: 'bodyNormalUnderline',
            }[e.type]
            let _anchor = e.entryId
            if (e.type !== BlockType.Entry) {
              _anchor += `/${e.index}`
            }

            // build extra tags
            const _extraTags: string[] = []
            if (e.type === BlockType.Entry && e.activeHeadings?.length) {
              _extraTags.push(
                ...e.activeHeadings
                  .filter((hr) => !!hr.relatedBlockText)
                  .map((hr) => {
                    const _prefix = getBlockPrefix(
                      hr.relatedBlockType as BlockType
                    )
                    return _prefix + hr.relatedBlockText
                  })
              )
            }
            return (
              <IndexResultDetails
                key={k}
                dataTestElement="search-result-entries"
                href={`/${getAccountFromLocation()}/pages/${
                  r.pageId
                }#${_anchor}`}
                text={
                  <>
                    <RawHtml
                      variant={_variant}
                      html={slateBlockToHtmlWithSearch(
                        { text: e.text, type: BlockType.Entry, _id: e.entryId },
                        // only allow alphanumeric, hyphen and space
                        searchQuery.replace(/[^a-zA-Z0-9À-ž-' ]/gi, '')
                      )}
                      mr="tiny"
                    />
                    <IndexResultTags tags={_extraTags} />
                  </>
                }
              />
            )
          })}
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
