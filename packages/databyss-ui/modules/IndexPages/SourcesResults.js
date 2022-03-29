import React from 'react'

import { BaseControl, Text, View } from '@databyss-org/ui/primitives'
import { CitationView, useNavigationContext } from '@databyss-org/ui/components'
import { urlSafeName } from '@databyss-org/services/lib/util'
import { useUserPreferencesContext } from '../../hooks'

export const SourcesResults = ({ entries }) => {
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
        return (
          <BaseControl
            key={index}
            mb="small"
            data-test-element="source-results"
            href={`/${getAccountFromLocation()}/sources/${
              entry.source._id
            }/${urlSafeName(
              entry.source.name?.textValue ?? entry.source.text.textValue
            )}`}
            py="tiny"
            userSelect="text"
          >
            <View>
              <Text variant="uiTextSmall" color="text.3" userSelect="none">
                {entry.source.name?.textValue}
              </Text>
            </View>
            {renderStyledCitation(entry.citation)}
          </BaseControl>
        )
      }
      return null
    })

  return <View widthVariant="content">{render()}</View>
}
