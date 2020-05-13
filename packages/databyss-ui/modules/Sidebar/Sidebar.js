import React from 'react'
import css from '@styled-system/css'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { Text, View, List, Separator } from '@databyss-org/ui/primitives'
import SidebarList from '../../components/Sidebar/SidebarList'
import SidebarCollapsed from './SidebarCollapsed'
import { darkTheme } from '../../theming/theme'
import Search from './routes/Search'
import Pages from './routes/Pages'

import Footer from '../../components/Sidebar/Footer'
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

const Sidebar = () => {
  const {
    navigateSidebar,
    getSidebarPath,
    isMenuOpen,
    setMenuOpen,
  } = useNavigationContext()
  const menuItem = getSidebarPath()

  /*
  if item active in menuItem, SidebarContent will compose a list to pass to SidebarList
  */

  const onHeaderClick = () => {
    if (menuItem) {
      return navigateSidebar('/')
    }
    return setMenuOpen(!isMenuOpen)
  }

  return isMenuOpen ? (
    <>
      <SidebarCollapsed />
      <View
        {...defaultProps}
        position="relative"
        css={css({
          width: '300px',
        })}
      >
        <View
          widthVariant="content"
          theme={darkTheme}
          bg="background.0"
          pt="medium"
          height="100vh"
        >
          <List
            verticalItemPadding={2}
            horizontalItemPadding={2}
            mt="none"
            mb="none"
            p="small"
            pl="medium"
            pr="medium"
            alignItems="center"
          >
            {/* header */}
            <Header onHeaderClick={onHeaderClick} />
            {/* search bar */}
            {menuItem !== 'search' && <Separator color="border.1" />}
            <Search
              onClick={() => {
                navigateSidebar('/search')
              }}
            />
            {/* content */}
            {/* default content */}
            {!menuItem && <SidebarList menuItem={menuItem} />}

            {menuItem === 'pages' && <Pages />}
          </List>
          {/* footer  */}
          <View position="absolute" bottom={0} left={0} width="300px">
            <Footer />
          </View>
        </View>
      </View>
    </>
  ) : (
    <SidebarCollapsed />
  )
}

export default Sidebar
