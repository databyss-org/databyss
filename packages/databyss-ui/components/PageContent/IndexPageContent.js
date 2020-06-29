import React from 'react'
import { Text, View, ScrollView } from '@databyss-org/ui/primitives'

const IndexPageContent = ({ title, children }) => (
  <ScrollView p="medium" flex="1" maxHeight="98vh">
    <View p="medium">
      <Text variant="bodyLarge" color="text.3">
        {title}
      </Text>
    </View>
    {children}
  </ScrollView>
)

export default IndexPageContent
