import React from 'react'
import { PageProvider } from '@databyss-org/services'
import SourceProvider from '@databyss-org/services/sources/SourceProvider'
import TopicProvider from '@databyss-org/services/topics/TopicProvider'
import { Sidebar, PageContent } from '@databyss-org/ui'
import { View } from '@databyss-org/ui/primitives'

const Private = () => {
  return (
    <PageProvider>
      <SourceProvider>
        <TopicProvider>
          <View flexDirection="row" display="flex" width="100vw">
            <Sidebar />
            <PageContent />
          </View>
        </TopicProvider>
      </SourceProvider>
    </PageProvider>
  )
}

export default Private
