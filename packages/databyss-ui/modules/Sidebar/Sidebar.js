import React from 'react'
import css from '@styled-system/css'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { Text, View, List } from '@databyss-org/ui/primitives'
import SidebarCollapsed from './SidebarCollapsed'
import { darkTheme } from '../../theming/theme'
import Search from './routes/Search'
import Pages from './routes/Pages'
import Header from '../../components/Sidebar/Header'

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

export const sidebarWidth = 240

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
        css={css({
          width: sidebarWidth,
        })}
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
          </List>
        </View>
      </View>
    </>
  ) : (
    <SidebarCollapsed />
  )
}

export default Sidebar
