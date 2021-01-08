import React from 'react'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { View, List } from '@databyss-org/ui/primitives'
import Footer from '@databyss-org/ui/components/Sidebar/Footer'
import SidebarCollapsed from './SidebarCollapsed'
import { darkTheme } from '../../theming/theme'
import Search from './routes/Search'
import Pages from './routes/Pages'
import Sources from './routes/Sources'
import Topics from './routes/Topics'
import Groups from './routes/Groups'
import Header from '../../components/Sidebar/Header'
import { sidebar } from '../../theming/components'

const Sidebar = () => {
  const { getSidebarPath, isMenuOpen } = useNavigationContext()
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
        >
          <List
            verticalItemPadding={0}
            verticalItemMargin="small"
            horizontalItemPadding={0}
            height="100%"
            flexGrow={1}
            flexShrink={1}
            mt="em"
            overflow="hidden"
          >
            <Header />
            <Search />
            {(menuItem === 'pages' || !menuItem) && <Pages />}
            {menuItem === 'sources' && <Sources hasIndexPage />}
            {menuItem === 'topics' && <Topics />}
            {menuItem === 'archive' && <Pages archive />}
            {menuItem === 'groups' && <Groups />}
            <Footer />
          </List>
        </View>
      </View>
    </>
  ) : (
    <SidebarCollapsed />
  )
}

export default Sidebar
