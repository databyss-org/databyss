import React, { useEffect } from 'react'
import { Router } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import SourceProvider from '@databyss-org/services/sources/SourceProvider'
import EntryProvider from '@databyss-org/services/entries/EntryProvider'
import GroupProvider from '@databyss-org/services/groups/GroupProvider'
import {
  Sidebar,
  useNavigationContext,
  ModalManager,
  PageContent,
  GroupDetail,
} from '@databyss-org/ui'
import { QueryClient, QueryClientProvider } from 'react-query'
import { GestureProvider, View } from '@databyss-org/ui/primitives'
import { BlockType } from '@databyss-org/services/interfaces'
import {
  SourcesContent,
  IndexPageContent,
  SearchContent,
} from '@databyss-org/ui/modules'
import { EditorPageProvider } from '@databyss-org/services'

const queryClient = new QueryClient()

const AppView = ({ children }) => (
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
      <EntryProvider>
        <SourceProvider>
          <GroupProvider>
            <GestureProvider>
              <Router>
                <AppView path="/:accountId">
                  <NotFoundRedirect default />
                  <EditorPageProvider path="pages">
                    <PageContent path=":id" />
                  </EditorPageProvider>
                  <SearchContent path="search/:query" />
                  <GroupDetail path="collections/:id" />
                  <IndexPageContent
                    blockType={BlockType.Source}
                    path="sources/:blockId"
                  />
                  <IndexPageContent
                    blockType={BlockType.Topic}
                    path="topics/:blockId"
                  />
                  <SourcesContent path="sources/" />
                </AppView>
              </Router>
              <ModalManager />
            </GestureProvider>
          </GroupProvider>
        </SourceProvider>
      </EntryProvider>
    </QueryClientProvider>
  )
}

export default Private
