import React, { useCallback, useState } from 'react'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
// import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { View, List } from '@databyss-org/ui/primitives'
import Footer from '@databyss-org/ui/components/Sidebar/Footer'
// import { Header } from '@databyss-org/ui/components/Sidebar'
import { BlockType } from '@databyss-org/services/interfaces'
import { darkTheme, pxUnits } from '@databyss-org/ui/theming/theme'
import { sidebar } from '@databyss-org/ui/theming/components'
import SidebarCollapsed from './SidebarCollapsed'
import { BlockList, PageList, GroupList } from './lists'
import { authorsToListItemData } from './transforms'
import Search from './Search'
import { ReferencesList } from './lists/ReferencesList'
import { ResizableColumnView } from '../../primitives/View/ResizableColumnView'

export const Sidebar = ({
  onResized,
  width,
}: {
  onResized?: (width: number) => void
  width: number
}) => {
  const { getSidebarPath, isMenuOpen } = useNavigationContext()
  const menuItem = getSidebarPath()

  /*
  if item active in menuItem, SidebarContent will compose a list to pass to SidebarList
  */

  return isMenuOpen ? (
    <>
      <SidebarCollapsed />
      <ResizableColumnView
        position="relative"
        width={width}
        key={`sidebar-key-${menuItem}`}
        overflow="hidden"
        onResized={onResized}
        minWidth={sidebar.width}
      >
        <View
          theme={darkTheme}
          bg="background.1"
          flexGrow={1}
          flexShrink={1}
          overflow="hidden"
          css={{ transform: 'translate(0,0)' }}
          borderLeftColor="border.2"
          borderLeftWidth={pxUnits(1)}
        >
          <List
            verticalItemPadding={pxUnits(11)}
            verticalItemMargin={0}
            horizontalItemPadding={0}
            height="100%"
            flexGrow={1}
            flexShrink={1}
            // mt={pxUnits(5)}
            py={0}
            overflow="hidden"
          >
            {/* <Header /> */}
            <Search bg="gray.1" />
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
            {menuItem === 'media' && (
              <BlockList blockType={BlockType.Embed} heading="Media" />
            )}
            <Footer collapsed={false} />
          </List>
        </View>
      </ResizableColumnView>
    </>
  ) : (
    <SidebarCollapsed />
  )
}
