import React, { useState } from 'react'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { Text, View, List } from '@databyss-org/ui/primitives'
import SearchInputContainer from '@databyss-org/ui/components/SearchContent/SearchInputContainer'
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
  const { getSidebarPath, isMenuOpen } = useNavigationContext()
  const { isPublicAccount } = useSessionContext()
  const menuItem = getSidebarPath()
  const [filterQuery, setFilterQuery] = useState({ textValue: '' })

  const clear = () => {
    setFilterQuery({ textValue: '' })
  }

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
            {menuItem === 'search' ? (
              <Search />
            ) : (
              <SearchInputContainer
                placeholder={`Search ${menuItem}`}
                onChange={setFilterQuery}
                onClear={clear}
              />
            )}
            {!isPublicAccount() &&
              (menuItem === 'pages' || !menuItem) && (
                <Pages filterQuery={filterQuery} />
              )}
            {menuItem === 'sources' && <Sources filterQuery={filterQuery} />}
            {menuItem === 'topics' && <Topics filterQuery={filterQuery} />}
          </List>
        </View>
      </View>
    </>
  ) : (
    <SidebarCollapsed />
  )
}

export default Sidebar
