import React from 'react'
import {
  Redirect,
  Router,
} from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { QueryClientProvider, QueryClient } from 'react-query'
import { getDefaultGroup } from '@databyss-org/services/session/clientStorage'
import { View } from '@databyss-org/ui/primitives'
import { EditorPageProvider } from '@databyss-org/services'

import PagesIndex from './Pages/PagesIndex'
import PageDetails from './Pages/PageDetails'
import SourcesIndex from './Sources/SourcesIndex'
import SourceDetails from './Sources/SourceDetails'
import AuthorDetails from './Sources/AuthorDetails'
import TopicsIndex from './Topics/TopicsIndex'
import TopicDetails from './Topics/TopicDetails'
import ConfigIndex from './Config/ConfigIndex'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Disable window focus refetching globally for all react-query hooks
      // see: https://react-query.tanstack.com/guides/window-focus-refetching
      refetchOnWindowFocus: false,
      // Never set queries as stale
      staleTime: Infinity,
      cacheTime: Infinity,
    },
  },
})

const RouterGroup = ({ children }) => <>{children}</>

// component
const Private = () => {
  // const { getCurrentAccount } = useSessionContext()

  const group = getDefaultGroup()

  // render methods
  const render = () => (
    <QueryClientProvider client={queryClient}>
      <View
        // position="absolute"
        // top="0"
        // bottom="0"
        flexGrow={1}
        flexShrink={1}
        width="100%"
        backgroundColor="background.1"
        overflow="hidden"
      >
        <Router>
          <Redirect noThrow from="/signup" to="/" />
          <RouterGroup path="/:accountId">
            <RouterGroup path="pages">
              <PagesIndex path="/" />
              <EditorPageProvider path=":pageId">
                <PageDetails default />
              </EditorPageProvider>
            </RouterGroup>

            <RouterGroup path="sources">
              <SourcesIndex path="/" />
              <RouterGroup path="/authors">
                <SourcesIndex path="/" />
                <AuthorDetails path="/:query" />
              </RouterGroup>
              <SourceDetails path="/:blockId" />
            </RouterGroup>

            <RouterGroup path="topics">
              <TopicsIndex path="/" />
              <TopicDetails path="/:blockId" />
            </RouterGroup>

            <RouterGroup path="config">
              <ConfigIndex path="/" />
            </RouterGroup>

            <Redirect noThrow from="*" to="/pages" />
          </RouterGroup>

          <Redirect noThrow from="*" to={`${group}/pages`} />
        </Router>
      </View>
    </QueryClientProvider>
  )

  return render()
}

export default Private
