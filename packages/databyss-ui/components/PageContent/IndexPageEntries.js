import React from 'react'
import { Text, View, BaseControl } from '@databyss-org/ui/primitives'

const IndexPageEntries = ({ entries }) =>
  entries.map((entry, index) => {
    if (entry.text) {
      return (
        <View key={index} mb="em" widthVariant="content">
          <BaseControl
            p="small"
            mx="em"
            hoverColor="background.2"
            activeColor="background.3"
          >
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
          {entry.citations && (
            <Text px="small" mx="em" variant="bodySmall" color="text.2">
              {entry.citations}
            </Text>
          )}
        </View>
      )
    }
    return null
  })

export default IndexPageEntries
