import React from 'react'
import { Text, View, ScrollView } from '@databyss-org/ui/primitives'
import { StickyHeader } from '../Navigation/SickyHeader'

const IndexPageContent = ({ indexName, title, children }) => (
  <>
    <StickyHeader path={[indexName, title]} />
    <ScrollView flex="1" shadowOnScroll>
      <View p="medium" pt="none" flexGrow={1}>
        <View p="medium">
          <Text variant="bodyHeading1" color="text.3">
            {title}
          </Text>
        </View>
        {children}
      </View>
    </ScrollView>
  </>
)

export default IndexPageContent
