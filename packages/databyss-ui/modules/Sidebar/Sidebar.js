import React from 'react'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { Text, View, List } from '@databyss-org/ui/primitives'
import SidebarCollapsed from './SidebarCollapsed'
import { darkTheme } from '../../theming/theme'
import Search from './routes/Search'
import Pages from './routes/Pages'
import Sources from './routes/Sources'
import Topics from './routes/Topics'
import Header from '../../components/Sidebar/Header'
import { sidebar } from '../../theming/components'

export const defaultProps = {
  height: '100vh',
}

const Section = ({ children, title, variant, ...others }) => (
  <View mb="medium" {...others}>
    <View mb="small">
      <Text variant={variant} color="text.3">
        {title}
      </Text>
    </View>
    {children}
  </View>
)

Section.defaultProps = {
  variant: 'heading3',
}

const Sidebar = () => {
  const { navigateSidebar, getSidebarPath, isMenuOpen } = useNavigationContext()
  const menuItem = getSidebarPath()

  /*
  if item active in menuItem, SidebarContent will compose a list to pass to SidebarList
  */

  return isMenuOpen ? (
    <>
      <SidebarCollapsed />
      <View
        {...defaultProps}
        position="relative"
        width={sidebar.width}
        key={`sidebar-key-${menuItem}`}
      >
        <View
          widthVariant="content"
          theme={darkTheme}
          bg="background.1"
          height="100vh"
        >
          <List
            verticalItemPadding={2}
            horizontalItemPadding={2}
            alignItems="center"
          >
            <Header />
            <Search
              onClick={() => {
                navigateSidebar('/search')
              }}
            />
            {(menuItem === 'pages' || !menuItem) && <Pages />}
            {menuItem === 'sources' && <Sources />}
            {menuItem === 'authors' && <Sources />}
            {menuItem === 'topics' && <Topics />}
          </List>
        </View>
      </View>
    </>
  ) : (
      <SidebarCollapsed />
    )
}

export default Sidebar
