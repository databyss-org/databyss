import React from 'react'

import { BaseControl, RawHtml, Text, View } from '@databyss-org/ui/primitives'
import { CitationView, useNavigationContext } from '@databyss-org/ui/components'
import { urlSafeName } from '@databyss-org/services/lib/util'
import { createHighlightRanges } from '@databyss-org/editor/lib/util'
import { textToHtml } from '@databyss-org/services/blocks'
import { htmlToDatabyssFrag } from '@databyss-org/editor/lib/clipboardUtils/databyssFragToHtmlString'
import {
  mergeRanges,
  SortOptions,
  splitOverlappingRanges,
} from '@databyss-org/services/blocks/textRanges'
import { useSearchContext, useUserPreferencesContext } from '../../hooks'

export const SourcesResults = ({ entries }) => {
  const searchTerms = useSearchContext((c) => c && c.normalizedStemmedTerms)
  const { getPreferredCitationStyle } = useUserPreferencesContext()
  const preferredCitationStyle = getPreferredCitationStyle()
  const { getAccountFromLocation } = useNavigationContext()

  // render methods
  const renderStyledCitation = (citation) => (
    <CitationView
      citation={citation}
      formatOptions={{ styleId: preferredCitationStyle }}
      textProps={{ color: 'text.0' }}
    />
  )

  const render = () =>
    entries?.map((entry, index) => {
      if (entry.source?.text) {
        const _nameText = {
          textValue: entry.source.name?.textValue ?? '',
          ranges: entry.source.name ? [...entry.source.name.ranges] : [],
        }
        const _highlightRanges = createHighlightRanges(
          _nameText.textValue,
          searchTerms
        )
        _nameText.ranges = mergeRanges(
          [..._nameText.ranges, ..._highlightRanges],
          SortOptions.Ascending
        )
        splitOverlappingRanges(_nameText.ranges)

        let _citationHtml = ''

        if (entry.citation) {
          const _citationBlock = htmlToDatabyssFrag(entry.citation)
          if (_citationBlock[0]?.text) {
            const _citationText = {
              textValue: _citationBlock[0]?.text.textValue,
              ranges: [..._citationBlock[0]?.text.ranges],
            }
            _citationText.ranges = mergeRanges(
              [
                ..._citationText.ranges,
                ...createHighlightRanges(_citationText.textValue, searchTerms),
              ],
              SortOptions.Ascending
            )
            splitOverlappingRanges(_citationText.ranges)
            _citationHtml = textToHtml(_citationText)
          }
        }

        return (
          <BaseControl
            key={index}
            mb="small"
            data-test-element="source-results"
            href={`/${getAccountFromLocation(true)}/sources/${
              entry.source._id
            }/${urlSafeName(
              entry.source.name?.textValue ?? entry.source.text.textValue
            )}`}
            py="tiny"
            userSelect="text"
          >
            <View>
              <Text variant="uiTextSmall" userSelect="none">
                <RawHtml color="text.3" html={textToHtml(_nameText)} />
              </Text>
            </View>
            {/* {renderStyledCitation(entry.citation)} */}
            <RawHtml html={_citationHtml} color="text.0" />
          </BaseControl>
        )
      }
      return null
    })

  return <View widthVariant="content">{render()}</View>
}
