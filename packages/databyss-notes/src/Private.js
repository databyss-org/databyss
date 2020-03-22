import React from 'react'
import { PageProvider } from '@databyss-org/services'
import SourceProvider from '@databyss-org/services/sources/SourceProvider'
import TopicProvider from '@databyss-org/services/topics/TopicProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { Sidebar, PageContent } from '@databyss-org/ui'
import { View } from '@databyss-org/ui/primitives'

const Private = () => {
  const { path } = useNavigationContext()
  return (
    <PageProvider>
      <SourceProvider>
        <TopicProvider>
          <View flexDirection="row" display="flex" width="100vw">
            <Sidebar />
            <PageContent key={path} />
          </View>
        </TopicProvider>
      </SourceProvider>
    </PageProvider>
  )
}

export default Private
