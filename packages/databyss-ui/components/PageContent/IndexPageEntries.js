import React from 'react'
import { Text, View, BaseControl } from '@databyss-org/ui/primitives'

const IndexPageEntries = ({ entries, page }) =>
  entries.map((entry, index) => (
    <View key={index} mb="em">
      <BaseControl
        py="small"
        px="small"
        mx="em"
        hoverColor="background.2"
        activeColor="background.3"
      >
        <Text variant="bodyNormalSemibold">
          {page === 'authors' ? entry.author : entry.text}
        </Text>
      </BaseControl>
    </View>
  ))

export default IndexPageEntries
