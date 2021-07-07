import React from 'react'

import { BaseControl, RawHtml, Text, View } from '@databyss-org/ui/primitives'
import { stateBlockToHtml } from '@databyss-org/editor/lib/slateUtils'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { CitationView, useNavigationContext } from '@databyss-org/ui/components'

export const SourcesResults = ({ entries }) => {
  const getPreferredCitationStyle = useSourceContext(
    (c) => c.getPreferredCitationStyle
  )
  const preferredCitationStyle = getPreferredCitationStyle()

  const { getAccountFromLocation } = useNavigationContext()

  // render methods
  const renderStyledCitation = (citation) => (
    <CitationView
      citation={citation}
      formatOptions={{ styleId: preferredCitationStyle }}
    />
  )

  const render = () =>
    entries?.map((entry, index) => {
      if (entry.source?.text) {
        return (
          <View key={index} mb="em" widthVariant="content">
            <BaseControl
              data-test-element="source-results"
              href={`/${getAccountFromLocation()}/sources/${entry.source._id}`}
              py="small"
              hoverColor="background.2"
              activeColor="background.3"
              userSelect="auto"
              childViewProps={{ flexDirection: 'row' }}
            >
              <Text variant="bodyNormalSemibold">
                <RawHtml html={stateBlockToHtml(entry.source)} />
              </Text>
            </BaseControl>

            {renderStyledCitation(entry.citation)}
          </View>
        )
      }
      return null
    })

  return render()
}
