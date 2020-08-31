import React, { useState } from 'react'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { Text, View, List } from '@databyss-org/ui/primitives'
import { pxUnits } from '@databyss-org/ui/theming/views'
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

const padding = 26
const headerHeight = 34
const footerHeight = 48
const searchBar = 54

export const sidebarListHeight = `calc(100vh - ${pxUnits(
  padding + headerHeight + footerHeight + searchBar
)})`

const Sidebar = () => {
  const { getSidebarPath, isMenuOpen } = useNavigationContext()
  const { isPublicAccount } = useSessionContext()
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
        <View theme={darkTheme} bg="background.1" height="100vh">
          <List verticalItemPadding={2} horizontalItemPadding={2}>
            <Header />
            <Search />
            {!isPublicAccount() &&
              (menuItem === 'pages' || !menuItem) && (
                <Pages filterQuery={filterQuery} height={sidebarListHeight} />
              )}
            {menuItem === 'sources' && (
              <Sources
                filterQuery={filterQuery}
                height={sidebarListHeight}
                hasIndexPage
              />
            )}
            {menuItem === 'topics' && (
              <Topics
                filterQuery={filterQuery}
                height={sidebarListHeight}
                hasIndexPage
              />
            )}
          </List>
        </View>
      </View>
    </>
  ) : (
    <SidebarCollapsed />
  )
}

export default Sidebar
