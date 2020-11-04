import React from 'react'

import {
  BaseControl,
  pxUnits,
  RawHtml,
  Text,
  View,
} from '@databyss-org/ui/primitives'
import { stateBlockToHtml } from '@databyss-org/editor/lib/slateUtils'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'

import Citation from '../Citation/Citation'

const IndexSourcePageEntries = ({ entries, onClick }) => {
  const getPreferredCitationStyle = useSourceContext(
    c => c.getPreferredCitationStyle
  )
  const preferredCitationStyle = getPreferredCitationStyle()

  // render methods
  const renderStyledCitation = entry => (
    <Citation
      citation={entry.citation}
      formatOptions={{ styleId: preferredCitationStyle }}
      childViewProps={{
        marginTop: pxUnits(10),
        marginBottom: pxUnits(10),
      }}
      citationTextProps={{
        color: 'gray.3',
        style: {
          lineHeight: 1.5,
        },
      }}
    />
  )

  const render = () =>
    entries?.map((entry, index) => {
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
              <Text variant="bodyNormalSemibold">
                <RawHtml html={stateBlockToHtml(entry)} />
              </Text>
            </BaseControl>

            {renderStyledCitation(entry)}
          </View>
        )
      }
      return null
    })

  return render()
}

export default IndexSourcePageEntries
