import React from 'react'
import { PageProvider } from '@databyss-org/services'
import SourceProvider from '@databyss-org/services/sources/SourceProvider'
import TopicProvider from '@databyss-org/services/topics/TopicProvider'
import EntryProvider from '@databyss-org/services/entries/EntryProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { Sidebar, PageContent, SearchContent } from '@databyss-org/ui'
import { View } from '@databyss-org/ui/primitives'

const Private = () => {
  const { path, getTokensFromPath } = useNavigationContext()
  const { type } = getTokensFromPath()

  return (
    <PageProvider>
      <EntryProvider>
        <SourceProvider>
          <TopicProvider>
            <View flexDirection="row" display="flex" width="100vw">
              <Sidebar />
              {type !== 'search' && <PageContent key={path} />}
              {type === 'search' && <SearchContent key={path} />}
            </View>
          </TopicProvider>
        </SourceProvider>
      </EntryProvider>
    </PageProvider>
  )
}

export default Private
