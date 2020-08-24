import React from 'react'
import { Text, View, ScrollView } from '@databyss-org/ui/primitives'
import { pxUnits, widthVariants } from '@databyss-org/ui/theming/views'

const IndexPageContent = ({ title, children }) => (
  <ScrollView
    p="medium"
    flex="1"
    maxHeight="98vh"
    maxWidth={widthVariants.content.maxWidth}
    css={{
      overflowWrap: 'anywhere',
      wordBreak: 'break-word',
    }}
  >
    <View py="medium" px={pxUnits(28)}>
      <Text variant="bodyHeading1" color="text.3">
        {title}
      </Text>
    </View>
    {children}
  </ScrollView>
)

export default IndexPageContent
