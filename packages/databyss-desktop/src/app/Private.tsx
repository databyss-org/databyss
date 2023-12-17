import React, { useEffect } from 'react'
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
  GroupDetail,
  Text,
} from '@databyss-org/ui'

import { GestureProvider, View } from '@databyss-org/ui/primitives'
import { BlockType, Group } from '@databyss-org/services/interfaces'
import {
  SourcesContent,
  IndexPageContent,
  SearchContent,
} from '@databyss-org/ui/modules'
import { EditorPageProvider } from '@databyss-org/services'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { useDocument } from '@databyss-org/data/pouchdb/hooks/useDocument'
import { dbRef } from '@databyss-org/data/pouchdb/dbRef'
import { darkContentTheme } from '@databyss-org/ui/theming/theme'

const AppView: React.FC<{ title: string }> = ({ children, title }) => (
  <View
    flexDirection="row"
    display="flex"
    width="100%"
    overflow="hidden"
    flexShrink={1}
    flexGrow={1}
    mt={pxUnits(36)}
  >
    <View
      position="absolute"
      top={0}
      left={0}
      height={pxUnits(36)}
      bg="gray.0"
      width="100%"
      alignItems="center"
      justifyContent="center"
      css={{
        // userSelect: 'none',
        '-webkit-user-select': 'none',
        '-webkit-app-region': 'drag',
      }}
    >
      <Text color="white" variant="uiTextSmall">
        {title}
      </Text>
    </View>
    <Sidebar />
    <View
      data-test-element="body"
      flexGrow={1}
      flexShrink={1}
      // theme={darkContentTheme}
      bg="background.0"
    >
      {children}
    </View>
  </View>
)

const Providers = ({ children }) => (
  <UserPreferencesProvider>
    <ExportProvider>{children}</ExportProvider>
  </UserPreferencesProvider>
)

export const Private = () => {
  const { location } = useNavigationContext()
  const getSession = useSessionContext((c) => c && c.getSession)
  const navigateToDefaultPage = useSessionContext(
    (c) => c && c.navigateToDefaultPage
  )
  const { provisionClientDatabase } = getSession()
  const groupRes = useDocument<Group>(dbRef.groupId ?? '', {
    enabled: dbRef.groupId !== null,
  })

  const appTitle = groupRes.isSuccess ? groupRes.data.name : 'Databyss'

  // Navigate to default page if nothing in path
  useEffect(() => {
    console.log('[Desktop] location', location.pathname)
    if (location.pathname === '/' || provisionClientDatabase) {
      navigateToDefaultPage(false)
    }
  }, [])

  return (
    <SearchProvider>
      <GestureProvider>
        <AppView title={appTitle}>
          <Providers>
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
                <Route
                  path="embeds/:blockId/*"
                  element={<IndexPageContent blockType={BlockType.Embed} />}
                />
                <Route path="*" element={<NotFoundRedirect />} />
              </Route>
              <Route path="*" element={<NotFoundRedirect />} />
            </Routes>
            <ModalManager />
          </Providers>
        </AppView>
      </GestureProvider>
    </SearchProvider>
  )
}
