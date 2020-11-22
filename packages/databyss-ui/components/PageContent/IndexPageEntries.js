import React from 'react'
import { Text, View, BaseControl, Icon } from '@databyss-org/ui/primitives'
import { defaultCitationStyle } from '@databyss-org/services/citations/constants'

import { SourceLoader } from '../Loaders'
import CitationLoader from '../Citation/CitationLoader'

const IndexPageEntries = ({ entries, icon, onClick }) => {
  const renderStyledCitation = (entry) => {
    const formatOptions = { styleId: defaultCitationStyle.id }

    return (
      <SourceLoader sourceId={entry.id}>
        {(source) => (
          <CitationLoader
            sourceDetail={source.detail}
            formatOptions={formatOptions}
          />
        )}
      </SourceLoader>
    )
  }

  const renderPlacesCited = (entry) =>
    entry.citations?.map((citation, i) => (
      <Text key={i} ml="medium" variant="bodySmall" color="text.2">
        {citation}
      </Text>
    ))

  const render = () =>
    entries.map((entry, index) => {
      if (entry.text) {
        return (
          <View key={index} mb="em" px="medium" widthVariant="content">
            <BaseControl
              data-test-element="source-results"
              onClick={() => {
                if (onClick) {
                  onClick(entry)
                }
              }}
              py="small"
              hoverColor="background.2"
              activeColor="background.3"
              userSelect="auto"
              childViewProps={{ flexDirection: 'row' }}
            >
              {icon && (
                <Icon sizeVariant="small" color="text.3" mt="tiny" mr="tiny">
                  {icon}
                </Icon>
              )}
              <Text
                variant={
                  entry.type === 'sources'
                    ? 'bodyNormalUnderline'
                    : 'bodyNormalSemibold'
                }
              >
                {entry.text}
              </Text>
            </BaseControl>

            {renderStyledCitation(entry)}

            {renderPlacesCited(entry)}
          </View>
        )
      }
      return null
    })

  return render()
}

export default IndexPageEntries
