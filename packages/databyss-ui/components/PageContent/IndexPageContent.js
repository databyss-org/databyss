import React from 'react'
import { Text, View, ScrollView } from '@databyss-org/ui/primitives'
import { StickyHeader } from '../Navigation/SickyHeader'
import { PageContentView } from './PageContent'

const IndexPageContent = ({ indexName, title, children }) => (
  <>
    <StickyHeader path={[indexName, title]} />
    <PageContentView>
      <View pb="medium">
        <Text variant="bodyHeading1" color="text.3" ml="medium">
          {title}
        </Text>
      </View>
      {children}
    </PageContentView>
  </>
)

export default IndexPageContent
