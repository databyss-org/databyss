import React from 'react'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { View, List } from '@databyss-org/ui/primitives'
import Footer from '@databyss-org/ui/components/Sidebar/Footer'
import {
  BlockList,
  PageList,
  GroupList,
  Search,
  Header,
} from '@databyss-org/ui/components/Sidebar'
import { BlockType } from '@databyss-org/services/interfaces'
import SidebarCollapsed from './SidebarCollapsed'
import { darkTheme, pxUnits } from '../../theming/theme'
import { sidebar } from '../../theming/components'
import { authorsFromSources } from './middleware'

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
            {menuItem === 'sources' && (
              <BlockList
                blockType={BlockType.Source}
                middleware={[authorsFromSources]}
                prependItems={[
                  {
                    type: 'sources',
                    text: 'All sources',
                    route: '/sources',
                  },
                  {
                    type: 'authors',
                    text: 'All authors',
                    route: '/sources/authors',
                  },
                ]}
              />
            )}
            {menuItem === 'topics' && <BlockList blockType={BlockType.Topic} />}
            {menuItem === 'archive' && <PageList archive />}
            {menuItem === 'groups' && <GroupList />}
            <Footer />
          </List>
        </View>
      </View>
    </>
  ) : (
    <SidebarCollapsed />
  )
}
