import React, { useState } from 'react'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { Text, View, List } from '@databyss-org/ui/primitives'
import Footer from '@databyss-org/ui/components/Sidebar/Footer'
import { pxUnits } from '@databyss-org/ui/theming/views'
import SidebarCollapsed from './SidebarCollapsed'
import { darkTheme } from '../../theming/theme'
import Search from './routes/Search'
import Pages from './routes/Pages'
import Sources from './routes/Sources'
import Topics from './routes/Topics'
import Archive from './routes/Archive'
import Header from '../../components/Sidebar/Header'
import { sidebar } from '../../theming/components'

export const defaultProps = {
  height: '100%',
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

const padding = 26
const headerHeight = 34
const footerHeight = 48
const searchBar = 54

export const sidebarListHeight = `calc(100% - ${pxUnits(
  padding + headerHeight + footerHeight + searchBar
)})`

const Sidebar = () => {
  const { getSidebarPath, isMenuOpen } = useNavigationContext()
  const menuItem = getSidebarPath()
  const [filterQuery] = useState({ textValue: '' })

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
        <View theme={darkTheme} bg="background.1" height="100%">
          <List
            verticalItemPadding={2}
            horizontalItemPadding={2}
            height="100%"
            pb={0}
          >
            <Header />
            <Search />
            {(menuItem === 'pages' || !menuItem) && (
              <Pages filterQuery={filterQuery} height="100%" />
            )}
            {menuItem === 'sources' && (
              <Sources filterQuery={filterQuery} height="100%" hasIndexPage />
            )}
            {menuItem === 'topics' && (
              <Topics filterQuery={filterQuery} height="100%" />
            )}
            {menuItem === 'archive' && (
              <Archive filterQuery={filterQuery} height="100%" />
            )}
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
