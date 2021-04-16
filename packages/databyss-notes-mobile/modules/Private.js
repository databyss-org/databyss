import React, { useState } from 'react'
import {
  Redirect,
  Router,
} from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { QueryClientProvider, QueryClient } from 'react-query'
import { View } from '@databyss-org/ui/primitives'
import { EditorPageProvider } from '@databyss-org/services'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import NavBar from '../components/NavBar'
import Tabs from '../constants/Tabs'

import PagesIndex from './Pages/PagesIndex'
import PageDetails from './Pages/PageDetails'
import SourcesIndex from './Sources/SourcesIndex'
import SourceDetails from './Sources/SourceDetails'
import AuthorDetails from './Sources/AuthorDetails'
import TopicsIndex from './Topics/TopicsIndex'
import TopicDetails from './Topics/TopicDetails'
import ConfigIndex from './Config/ConfigIndex'

// test

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
  const getSession = useSessionContext((c) => c && c.getSession)
  const { defaultGroupId } = getSession()

  const [currentTab, setCurrentTab] = useState(Tabs.PAGES)

  const onNavBarChange = (item) => {
    if (item.name !== currentTab) {
      setCurrentTab(item.name)

      if (window) {
        window.scrollTo(0, 0)
      }
    }
  }

  // render methods
  const render = () => (
    <QueryClientProvider client={queryClient}>
      <View
        position="absolute"
        top="0"
        bottom="0"
        width="100%"
        backgroundColor="background.1"
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

            <Redirect noThrow from="*" to="pages" />
          </RouterGroup>

          <Redirect noThrow from="*" to={`${defaultGroupId}/pages`} />
        </Router>

        <NavBar onChange={onNavBarChange} />
      </View>
    </QueryClientProvider>
  )

  return render()
}

export default Private
