import React, { useEffect } from 'react'
import {
  Routes,
  Route,
} from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { SearchProvider, UserPreferencesProvider } from '@databyss-org/ui/hooks'
import { ExportProvider } from '@databyss-org/services/export'
import {
  Sidebar,
  useNavigationContext,
  ModalManager,
  PageContent,
  GroupDetail,
} from '@databyss-org/ui'
import { QueryClient, QueryClientProvider } from 'react-query'
// import { ReactQueryDevtools } from 'react-query/devtools'

import { GestureProvider, View } from '@databyss-org/ui/primitives'
import { BlockType } from '@databyss-org/services/interfaces'
import {
  SourcesContent,
  IndexPageContent,
  SearchContent,
} from '@databyss-org/ui/modules'
import { EditorPageProvider } from '@databyss-org/services'

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

const Providers = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <UserPreferencesProvider>
      <ExportProvider>
        <SearchProvider>
          <GestureProvider>{children}</GestureProvider>
        </SearchProvider>
      </ExportProvider>
    </UserPreferencesProvider>
    {/* <ReactQueryDevtools initialIsOpen={false} /> */}
  </QueryClientProvider>
)

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
    <Providers>
      <AppView>
        <Routes>
          <Route
            path="/:accountId/*"
            element={
              <Routes>
                <Route
                  path="pages/:id/*"
                  element={
                    <EditorPageProvider>
                      <PageContent />
                    </EditorPageProvider>
                  }
                />
                <Route path="search/:query" element={<SearchContent />} />
                <Route path="collections/:id" element={<GroupDetail />} />
                <Route
                  path="sources/:blockId/*"
                  element={<IndexPageContent blockType={BlockType.Source} />}
                />
                <Route
                  path="topics/:blockId/*"
                  element={<IndexPageContent blockType={BlockType.Topic} />}
                />
                <Route path="sources/*" element={<SourcesContent />} />
                <Route path="*" element={<NotFoundRedirect />} />
              </Routes>
            }
          />
          <Route path="*" element={<NotFoundRedirect />} />
        </Routes>
      </AppView>
      <ModalManager />
    </Providers>
  )
}

export default Private
