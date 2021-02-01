import React, { useEffect } from 'react'
import { Router } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { PageProvider } from '@databyss-org/services'
import SourceProvider from '@databyss-org/services/sources/SourceProvider'
import TopicProvider from '@databyss-org/services/topics/TopicProvider'
import EntryProvider from '@databyss-org/services/entries/EntryProvider'
import GroupProvider from '@databyss-org/services/groups/GroupProvider'
import { Sidebar, useNavigationContext, ModalManager } from '@databyss-org/ui'
import { QueryClient, QueryClientProvider } from 'react-query'
import { GestureProvider, View } from '@databyss-org/ui/primitives'
import { BlockType } from '@databyss-org/services/interfaces'
import { PageRouter, IndexRouter, GroupRouter, SearchRouter } from '../routes'

const queryClient = new QueryClient()

const App = ({ children }) => (
  <View
    flexDirection="row"
    display="flex"
    width="100%"
    overflow="hidden"
    flexShrink={1}
    flexGrow={1}
  >
    <Sidebar />
    <View data-test-element="body" flexGrow={1} flexShrink={1}>
      {children}
    </View>
  </View>
)

const NotFoundRedirect = () => {
  const { navigate } = useNavigationContext()
  const getSession = useSessionContext((c) => c && c.getSession)

  const { defaultGroupId, defaultPageId } = getSession()

  // if no page found, navigate to default page
  useEffect(() => {
    navigate(`/${defaultGroupId}/pages/${defaultPageId}`, {
      hasAccount: true,
    })
  }, [])

  return null
}

const Private = () => {
  const { location, navigate } = useNavigationContext()
  const getSession = useSessionContext((c) => c && c.getSession)
  const {
    defaultGroupId,
    defaultPageId,
    provisionClientDatabase,
  } = getSession()

  // const { defaultGroupId, defaultPageId } = user

  // Navigate to default page is nothing in path
  useEffect(() => {
    if (location.pathname === '/' || provisionClientDatabase) {
      navigate(`/${defaultGroupId}/pages/${defaultPageId}`, {
        hasAccount: true,
      })
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <PageProvider>
        <EntryProvider>
          <SourceProvider>
            <TopicProvider>
              <GroupProvider>
                <GestureProvider>
                  <Router>
                    <App path="/:accountId">
                      <NotFoundRedirect default />
                      <PageRouter path="pages/*" />
                      <SearchRouter path="search/*" />
                      <GroupRouter path="collections/*" />
                      <IndexRouter
                        blockType={BlockType.Source}
                        path="sources/*"
                      />
                      <IndexRouter
                        blockType={BlockType.Topic}
                        path="topics/*"
                      />
                    </App>
                  </Router>
                  <ModalManager />
                </GestureProvider>
              </GroupProvider>
            </TopicProvider>
          </SourceProvider>
        </EntryProvider>
      </PageProvider>
    </QueryClientProvider>
  )
}

export default Private
