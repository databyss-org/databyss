import React, { useCallback, useEffect, useState } from 'react'
import {
  Routes,
  Route,
  NotFoundRedirect,
} from '@databyss-org/ui/components/Navigation'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { SearchProvider, UserPreferencesProvider } from '@databyss-org/ui/hooks'
import { ExportProvider } from '@databyss-org/services/export'
import {
  Sidebar,
  useNavigationContext,
  ModalManager,
  PageContent,
} from '@databyss-org/ui'

import { GestureProvider, View } from '@databyss-org/ui/primitives'
import { BlockType } from '@databyss-org/services/interfaces'
import {
  SourcesContent,
  IndexPageContent,
  SearchContent,
} from '@databyss-org/ui/modules'
import { EditorPageProvider } from '@databyss-org/services'
import { useAppState } from '@databyss-org/desktop/src/hooks'
import theme, { darkContentTheme } from '@databyss-org/ui/theming/theme'
import { sidebar } from '@databyss-org/ui/theming/components'

const AppView = ({ children }) => {
  const [sidebarWidth, setSidebarWidth] = useState(null)
  const isDarkModeRes = useAppState('darkMode')

  useEffect(() => {
    window.eapi.state.get('sidebarWidth').then((width) => {
      setSidebarWidth(width ?? sidebar.width)
    })
  }, [])

  const onSidebarResized = useCallback(
    (width) => {
      setSidebarWidth(width)
      window.eapi.state.set('sidebarWidth', width)
    },
    [window.eapi]
  )
  return (
    <View
      flexDirection="row"
      display="flex"
      width="100%"
      overflow="hidden"
      flexShrink={1}
      flexGrow={1}
    >
      {sidebarWidth !== null && (
        <Sidebar onResized={onSidebarResized} width={sidebarWidth} />
      )}
      <View
        theme={isDarkModeRes.data ? darkContentTheme : theme}
        data-test-element="body"
        flexGrow={1}
        flexShrink={1}
        overflow="hidden"
      >
        {children}
      </View>
    </View>
  )
}

const Providers = ({ children }) => (
  <UserPreferencesProvider>
    <ExportProvider>
      <SearchProvider>
        <GestureProvider>{children}</GestureProvider>
      </SearchProvider>
    </ExportProvider>
  </UserPreferencesProvider>
)

const Private = () => {
  const { location } = useNavigationContext()
  const getSession = useSessionContext((c) => c && c.getSession)
  const navigateToDefaultPage = useSessionContext(
    (c) => c && c.navigateToDefaultPage
  )
  const { provisionClientDatabase } = getSession()

  // Navigate to default page if nothing in path
  useEffect(() => {
    if (location.pathname === '/' || provisionClientDatabase) {
      navigateToDefaultPage(false)
    }
  }, [])

  return (
    <Providers>
      <AppView>
        <Routes>
          <Route path="/:accountId/*">
            <Route
              path="pages/:id/*"
              element={
                <EditorPageProvider>
                  <PageContent />
                </EditorPageProvider>
              }
            />
            <Route path="search/:query" element={<SearchContent />} />
            <Route
              path="sources/:blockId/*"
              element={<IndexPageContent blockType={BlockType.Source} />}
            />
            <Route
              path="topics/:blockId/*"
              element={<IndexPageContent blockType={BlockType.Topic} />}
            />
            <Route path="sources/*" element={<SourcesContent />} />
            <Route
              path="embeds/:blockId/*"
              element={<IndexPageContent blockType={BlockType.Embed} />}
            />
            <Route path="*" element={<NotFoundRedirect />} />
          </Route>
          <Route path="*" element={<NotFoundRedirect />} />
        </Routes>
      </AppView>
      <ModalManager />
    </Providers>
  )
}

export default Private
