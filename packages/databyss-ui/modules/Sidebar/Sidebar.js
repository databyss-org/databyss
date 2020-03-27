import React, { useState } from 'react'
import css from '@styled-system/css'
import { PagesLoader } from '@databyss-org/ui/components/Loaders'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { Text, View, List, Separator } from '@databyss-org/ui/primitives'
import SidebarList from './SidebarList'
import SidebarCollapsed from './SidebarCollapsed'
import { darkTheme } from '../../theming/theme'
import Search from './routes/Search'
import Footer from '../../components/Sidebar/Footer'
import Header from '../../components/Sidebar/Header'

export const defaultProps = {
  height: '100vh',
}

const headerMap = type => {
  if (type) {
    return { pages: 'Pages', search: 'Search' }[type]
  }
  return 'Databyss'
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
  const { navigate } = useNavigationContext()
  const [menuOpen, toggleMenuOpen] = useState(true)
  const [menuItem, setMenuItem] = useState(false)

  const onToggleMenuOpen = () => {
    toggleMenuOpen(!menuOpen)
  }

  /*
  if item active in menuItem, SidebarContent will compose a list to pass to SidebarList
  */

  const SidebarContent = () => {
    if (menuItem === 'pages') {
      return (
        <PagesLoader>
          {pages => {
            const _menuItems = Object.values(pages).map(p => ({
              text: p.name,
              type: 'pages',
              id: p._id,
            }))
            // alphabetize list
            _menuItems.sort((a, b) => (a.text > b.text ? 1 : -1))

            return SidebarList({
              menuItems: _menuItems,
              menuItem,
              menuOpen,
              onToggleMenuOpen,
              onItemClick: id => {
                // if no id is passed, menu will go back to default content
                if (!id) {
                  return setMenuItem(false)
                }
                return navigate(`/pages/${id}`)
              },
            })
          }}
        </PagesLoader>
      )
    }
    if (menuItem === 'search') {
      return null
    }
    return SidebarList({
      menuOpen,
      menuItem,
      onToggleMenuOpen,
      onItemClick: setMenuItem,
    })
  }

  const onHeaderClick = () => {
    if (menuItem) {
      return setMenuItem(false)
    }
    return toggleMenuOpen(!menuOpen)
  }

  return menuOpen ? (
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
          <Header onHeaderClick={onHeaderClick} menuItem={menuItem} />
          {/* content */}
          {menuItem !== 'search' && <Separator color="border.1" />}
          <Search menuItem={menuItem} onClick={() => setMenuItem('search')} />
          <SidebarContent />
        </List>
        {/* footer  */}
        <View position="absolute" bottom={0} left={0} width="300px">
          <Footer setMenuItem={setMenuItem} />
        </View>
      </View>
    </View>
  ) : (
    <SidebarCollapsed
      onToggleMenuOpen={onToggleMenuOpen}
      setMenuItem={setMenuItem}
    />
  )
}

export default Sidebar
