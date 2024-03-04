import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
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
import theme, { darkContentTheme, darkTheme } from '@databyss-org/ui/theming/theme'
import SidebarSvg from '@databyss-org/ui/assets/sidebar.svg'
import ChevronSvg from '@databyss-org/ui/assets/chevron-right.svg'
import DatabyssImg from '@databyss-org/ui/assets/logo-thick.png'
import { DatabyssMenu } from '@databyss-org/ui/components/Menu/DatabyssMenu'
import { setGroup } from '@databyss-org/data/pouchdb/groups'
import MenuSvg from '@databyss-org/ui/assets/menu_horizontal.svg'
import { debounce } from 'lodash'
import { TitleBar } from '../components/TitleBar'
import { useAppState } from '../hooks'

const GroupNameInput = ({
  groupName,
  onGroupNameChanged,
}: {
  groupName: string
  onGroupNameChanged: (name: string) => void
}) => {
  const prevGroupNameRef = useRef(groupName)
  const [_groupName, _setGroupName] = useState<string>(groupName)

  const debouncedGroupNameChanged = debounce((name) => {
    onGroupNameChanged(name)
  }, 500)

  useEffect(() => {
    if (_groupName === prevGroupNameRef.current) {
      _setGroupName(groupName)
      prevGroupNameRef.current = groupName
    }
  }, [groupName])

  return (
    <TextControl
      color="gray.5"
      inputVariant="uiTextSmall"
      hoverColor="background.1"
      ml="small"
      px="tiny"
      value={{
        textValue:
          _groupName === process.env.UNTITLED_GROUP_NAME ? '' : _groupName,
        ranges: [],
      }}
      placeholder={process.env.UNTITLED_GROUP_NAME}
      inputProps={{
        textAlign: 'left',
        autoSize: true,
      }}
      flexGrow={1}
      onChange={({ textValue }) => {
        const _name = textValue.trim().length
          ? textValue
          : process.env.UNTITLED_GROUP_NAME
        _setGroupName(textValue)
        debouncedGroupNameChanged(_name)
      }}
    />
  )
}

const AppView = ({
  children,
  title,
  onGroupNameChanged,
}: {
  children: ReactNode
  title: string
  onGroupNameChanged: (name: string) => void
}) => {
  const { setMenuOpen, isMenuOpen } = useNavigationContext()
  const [showDatabyssMenu, setShowDatabyssMenu] = useState(false)
  const navigate = useNavigate()
  const onToggleSidebar = () => {
    setMenuOpen(!isMenuOpen)
  }
  const [sidebarWidth, setSidebarWidth] = useState(null)
  const isDarkModeRes = useAppState('darkMode')

  useEffect(() => {
    eapi.state.get('sidebarWidth').then((width) => {
      setSidebarWidth(width)
    })
  }, [])

  const onSidebarResized = useCallback(
    (width: number) => {
      setSidebarWidth(width)
      eapi.state.set('sidebarWidth', width)
    },
    [eapi]
  )

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
      <TitleBar>
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
          <GroupNameInput
            groupName={title}
            onGroupNameChanged={onGroupNameChanged}
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
      </TitleBar>
      {showDatabyssMenu && (
        <DatabyssMenu
          allowContextMenus={false}
          onDismiss={() => setShowDatabyssMenu(false)}
        />
      )}
      {sidebarWidth && (
        <Sidebar onResized={onSidebarResized} width={sidebarWidth} />
      )}
      <View
        data-test-element="body"
        flexGrow={1}
        flexShrink={1}
        theme={isDarkModeRes.data ? darkContentTheme : theme}
        bg="background.1"
        minWidth={0}
        position="relative"
      >
        <View
          justifyContent="space-between"
          alignItems="center"
          flexDirection="row"
          bg="background.2"
          minHeight={pxUnits(58)}
          width="100%"
          position="absolute"
          zIndex={0}
          pr="medium"
          pl={pxUnits(18)}
        >
          <View flexGrow={1}>
            <Text color="text.3" variant="uiTextSmall">Loading...</Text>
          </View>
          <Icon sizeVariant="medium" color="text.3" flexShrink={1}>
            <MenuSvg />
          </Icon>
        </View>
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
  const groupRes = useDocument<Group>(dbRef.groupId, {
    enabled: dbRef.groupId !== null,
  })

  console.log('[Private] groupRes.data', dbRef.groupId, groupRes.data)

  const groupName = groupRes.data?.name ?? 'Databyss'

  const onGroupNameChanged = useCallback(
    async (name: string) => {
      setGroup({ ...groupRes.data, name })
      const _localGroups = await eapi.state.get('localGroups')
      await eapi.state.set(
        'localGroups',
        _localGroups.map((group) => {
          if (group._id === groupRes.data._id) {
            return {
              ...group,
              name,
            }
          }
          return group
        })
      )
    },
    [groupRes.data]
  )

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
        <AppView
          title={groupName ?? 'Databyss'}
          onGroupNameChanged={onGroupNameChanged}
        >
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
