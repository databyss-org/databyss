import React from 'react'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { View, List } from '@databyss-org/ui/primitives'
import Footer from '@databyss-org/ui/components/Sidebar/Footer'
import { Header } from '@databyss-org/ui/components/Sidebar'
import { BlockType } from '@databyss-org/services/interfaces'
import { darkTheme, pxUnits } from '@databyss-org/ui/theming/theme'
import { sidebar } from '@databyss-org/ui/theming/components'
import SidebarCollapsed from './SidebarCollapsed'
import { BlockList, PageList, GroupList } from './lists'
import { authorsToListItemData } from './transforms'
import Search from './Search'
import { ReferencesList } from './lists/ReferencesList'

export const Sidebar = () => {
  const { getSidebarPath, isMenuOpen } = useNavigationContext()
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)
  const menuItem = getSidebarPath()

  /*
  if item active in menuItem, SidebarContent will compose a list to pass to SidebarList
  */

  return isMenuOpen ? (
    <>
      <SidebarCollapsed />
      <View
        position="relative"
        width={sidebar.width}
        key={`sidebar-key-${menuItem}`}
        overflow="hidden"
      >
        <View
          theme={darkTheme}
          bg="background.1"
          flexGrow={1}
          flexShrink={1}
          overflow="hidden"
          css={{ transform: 'translate(0,0)' }}
        >
          <List
            verticalItemPadding={0}
            verticalItemMargin={pxUnits(10)}
            horizontalItemPadding={0}
            height="100%"
            flexGrow={1}
            flexShrink={1}
            mt={pxUnits(5)}
            overflow="hidden"
          >
            {/* TODO: on public collections, change name and link it to defaultPage */}
            {isPublicAccount() && <Header />}
            <Search />
            {(menuItem === 'pages' || !menuItem) && <PageList />}
            {menuItem === 'references' && <ReferencesList />}
            {menuItem === 'sources' && (
              <BlockList
                blockType={BlockType.Source}
                transform={authorsToListItemData}
                heading="Sources"
                prependItems={[
                  {
                    type: 'sources',
                    text: 'Bibliography',
                    route: '/sources',
                  },
                ]}
              />
            )}
            {menuItem === 'topics' && (
              <BlockList blockType={BlockType.Topic} heading="Topics" />
            )}
            {menuItem === 'archive' && <PageList archive />}
            {menuItem === 'groups' && <GroupList />}
            <Footer collapsed={false} />
          </List>
        </View>
      </View>
    </>
  ) : (
    <SidebarCollapsed />
  )
}
