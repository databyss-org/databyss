import React from 'react'
import { Text, View, BaseControl } from '@databyss-org/ui/primitives'

const IndexPageEntries = ({ entries }) =>
  entries.map((entry, index) => {
    if (entry.text) {
      return (
        <View key={index} mb="em">
          <BaseControl
            py="small"
            px="small"
            mx="em"
            hoverColor="background.2"
            activeColor="background.3"
          >
            <Text variant="bodyNormalSemibold">{entry.text}</Text>
          </BaseControl>
        </View>
      )
    }
    return null
  })

export default IndexPageEntries
