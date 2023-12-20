import React, { useRef } from 'react'
import { useParams } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import { Text } from '@databyss-org/ui/primitives'
import { getInlineAtomicHref } from '@databyss-org/editor/lib/util'
import {
  IndexResultsContainer,
  IndexResultTitle,
  IndexResultDetails,
  LoadingFallback,
} from '@databyss-org/ui/components'
import { useSearchEntries } from '@databyss-org/data/pouchdb/hooks'
import { Block, BlockType } from '@databyss-org/editor/interfaces'
import { SearchEntriesResultPage } from '@databyss-org/data/pouchdb/entries/lib/searchEntries'
import { urlSafeName } from '@databyss-org/services/lib/util'
import BlockSvg from '@databyss-org/ui/assets/arrowRight.svg'
import { IndexPageView } from './IndexPageContent'
import { IndexResultTags } from './IndexResults'
import { useSearchContext } from '../../hooks'
import { useScrollMemory } from '../../hooks/scrollMemory/useScrollMemory'

export const SearchContent = () => {
  const { getAccountFromLocation, navigate } = useNavigationContext()
  const searchQuery = decodeURIComponent(useParams().query!)
  const searchRes = useSearchEntries(searchQuery)
  const scrollViewRef = useRef<HTMLElement | null>(null)
  const restoreScroll = useScrollMemory(scrollViewRef)
  const normalizedStemmedTerms = useSearchContext(
    (c) => c && c.normalizedStemmedTerms
  )

  const composeResults = (results: SearchEntriesResultPage[]) => {
    const _Pages = results.length ? (
      Object.values(results).map((r, i) => (
        <IndexResultsContainer key={i}>
          <IndexResultTitle
            href={`/${getAccountFromLocation(true)}/pages/${
              r.pageId
            }/${urlSafeName(r.pageName)}`}
            text={r.pageName}
            icon={<PageSvg />}
            dataTestElement="search-result-page"
          />

          {r.entries.map((e, k) => {
            if (e.index === 0) {
              return null
            }
            const _variant = {
              [BlockType.Entry]: 'bodyNormal',
              [BlockType.Topic]: 'bodyNormalSemibold',
              [BlockType.Source]: 'bodyNormalUnderline',
            }[e.type]
            const _anchor = e.index

            // build extra tags
            const _extraTags: Block[] = []
            if (e.type === BlockType.Entry && e.activeHeadings?.length) {
              _extraTags.push(
                ...e.activeHeadings
                  .filter((hr) => !!hr.relatedBlockText)
                  .map((hr) => {
                    const _block = {
                      _id: hr.relatedBlock,
                      type: hr.relatedBlockType as BlockType,
                      text: {
                        textValue: hr.relatedBlockText ?? '',
                        ranges: [],
                      },
                      name: {
                        textValue: hr.relatedBlockText ?? '',
                        ranges: [],
                      },
                    }
                    return _block as Block
                  })
              )
            }
            const _block: Block = {
              _id: e.entryId,
              type: e.type,
              text: e.text,
            }

            return (
              <IndexResultDetails
                key={k}
                dataTestElement="search-result-entries"
                href={`/${getAccountFromLocation(true)}/pages/${
                  r.pageId
                }/${urlSafeName(r.pageName)}#${_anchor}`}
                block={_block}
                normalizedStemmedTerms={normalizedStemmedTerms}
                onInlineClick={(d) => navigate(getInlineAtomicHref(d))}
                icon={<BlockSvg />}
                tags={<IndexResultTags tags={_extraTags} />}
                textVariant={_variant}
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

  if (searchRes.isSuccess) {
    restoreScroll()
  }

  return (
    <IndexPageView path={['Search', searchQuery]} scrollViewRef={scrollViewRef}>
      {searchRes.isSuccess ? (
        composeResults(searchRes.data)
      ) : (
        <LoadingFallback
          queryObserver={searchRes}
          // showLongWaitMessage
          // longWaitMs={7000}
          // longWaitDialogOptions={{
          //   message:
          //     "<strong>⏳ Databyss is still building your search index, which may take a while but will allow fast searching once it's done.</strong>",
          //   html: true,
          //   showConfirmButtons: true,
          // }}
        />
      )}
    </IndexPageView>
  )
}
