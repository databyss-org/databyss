import React from 'react'
import { Text, View, ScrollView } from '@databyss-org/ui/primitives'
import { pxUnits } from '@databyss-org/ui/theming/views'

const IndexPageContent = ({ title, children }) => (
  <ScrollView p="medium" flex="1">
    <View py="medium" px={pxUnits(28)}>
      <Text variant="bodyHeading1" color="text.3">
        {title}
      </Text>
    </View>
    {children}
  </ScrollView>
)

export default IndexPageContent
