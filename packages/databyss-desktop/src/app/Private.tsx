import React, { useEffect, useState } from 'react'
import {
  Routes,
  Route,
  NotFoundRedirect,
  useNavigate,
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
  Icon,
  BaseControl,
  TextControl,
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
import { darkTheme } from '@databyss-org/ui/theming/theme'
import SidebarSvg from '@databyss-org/ui/assets/sidebar.svg'
import ChevronSvg from '@databyss-org/ui/assets/chevron-right.svg'
import DatabyssImg from '@databyss-org/ui/assets/logo-thick.png'
import { DatabyssMenu } from '@databyss-org/ui/components/Menu/DatabyssMenu'

const AppView: React.FC<{ title: string }> = ({ children, title }) => {
  const { setMenuOpen, isMenuOpen } = useNavigationContext()
  const [showDatabyssMenu, setShowDatabyssMenu] = useState(false)
  const navigate = useNavigate()
  const onToggleSidebar = () => {
    setMenuOpen(!isMenuOpen)
  }

  return (
    <View
      flexDirection="row"
      display="flex"
      width="100%"
      overflow="hidden"
      flexShrink={1}
      flexGrow={1}
      mt={pxUnits(38)}
    >
      <View
        position="absolute"
        top={0}
        left={0}
        height={pxUnits(38)}
        bg="gray.0"
        width="100%"
        alignItems="center"
        justifyContent="left"
        flexDirection="row"
        pl={pxUnits(74)}
        css={{
          '-webkit-user-select': 'none',
          '-webkit-app-region': 'drag',
        }}
      >
        <View
          alignItems="center"
          flexDirection="row"
          css={{
            '-webkit-user-select': 'auto',
            '-webkit-app-region': 'no-drag',
          }}
        >
          <BaseControl onPress={onToggleSidebar} ml="small">
            <Icon sizeVariant="small" color="gray.4">
              <SidebarSvg />
            </Icon>
          </BaseControl>
          <BaseControl onPress={() => navigate(-1)} ml="small">
            <Icon
              sizeVariant="small"
              color="gray.4"
              css={{ transform: 'scaleX(-1)' }}
            >
              <ChevronSvg />
            </Icon>
          </BaseControl>
          <BaseControl onPress={() => navigate(1)} ml="small">
            <Icon sizeVariant="small" color="gray.4">
              <ChevronSvg />
            </Icon>
          </BaseControl>
        </View>
        <View flexGrow={1} />
        <View
          alignItems="center"
          justifyContent="end"
          flexDirection="row"
          flexShrink={1}
          px="medium"
          theme={darkTheme}
          css={{
            '-webkit-user-select': 'auto',
            '-webkit-app-region': 'no-drag',
          }}
        >
          <TextControl
            color="gray.5"
            inputVariant="uiTextSmall"
            hoverColor="background.1"
            ml="small"
            px="tiny"
            value={{ textValue: title, ranges: [] }}
            inputProps={{
              textAlign: 'right',
              autoSize: true,
            }}
            flexGrow={1}
          />
          <BaseControl
            onPress={() => setShowDatabyssMenu(!showDatabyssMenu)}
            mr="tiny"
            ml="small"
          >
            <Icon sizeVariant="small">
              <img src={DatabyssImg} />
            </Icon>
          </BaseControl>
        </View>
      </View>
      {showDatabyssMenu && (
        <DatabyssMenu onDismiss={() => setShowDatabyssMenu(false)} />
      )}
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
}

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
