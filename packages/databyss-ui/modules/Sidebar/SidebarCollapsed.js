import React from 'react'
import css from '@styled-system/css'
import { Text, View, List } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import PagesSvg from '@databyss-org/ui/assets/pages.svg'
import SearchSvg from '@databyss-org/ui/assets/search.svg'
import MenuCollapseSvg from '@databyss-org/ui/assets/menu_collapse.svg'
import MenuSvg from '@databyss-org/ui/assets/menu.svg'
import { pxUnits } from '@databyss-org/ui/theming/views'
import SidebarIconButton from '@databyss-org/ui/components/Sidebar/SidebarIconButton'
import Footer from '@databyss-org/ui/components/Sidebar/Footer'
import { darkTheme } from '../../theming/theme'

export const defaultProps = {
  height: '100vh',
}

export const sidebarCollapsedWidth = 56

const SidebarCollapsed = () => {
  const {
    navigateSidebar,
    getSidebarPath,
    isMenuOpen,
    setMenuOpen,
  } = useNavigationContext()

  const onItemClick = item => {
    navigateSidebar(`/${item}`)
  }

  const sideBarCollapsedItems = [
    {
      name: 'menuCollapse',
      icon: isMenuOpen ? <MenuCollapseSvg /> : <MenuSvg />,
      onClick: () => setMenuOpen(!isMenuOpen),
    },
    {
      name: 'search',
      icon: <SearchSvg />,
      onClick: () => onItemClick('search'),
    },
    {
      name: 'pages',
      icon: <PagesSvg />,
      onClick: () => onItemClick('pages'),
    },
  ]

  const getBorderPosition = itemName => {
    const itemIndex = sideBarCollapsedItems
      .map(item => item.name)
      .indexOf(itemName)
    const startPosition = 12

    return startPosition + itemIndex * 60
  }

  return (
    <View
      {...defaultProps}
      widthVariant="content"
      theme={darkTheme}
      bg="background.1"
      height="100vh"
      borderRightColor="border.1"
      borderRightWidth={pxUnits(1)}
      css={css({
        width: sidebarCollapsedWidth,
      })}
    >
      <List verticalItemPadding={2} horizontalItemPadding={1} m="none">
        {sideBarCollapsedItems.map(item => (
          <SidebarIconButton
            key={item.name}
            icon={item.icon}
            isActive={getSidebarPath() === item.name}
            onClick={item.onClick}
            borderPosition={getBorderPosition(item.name)}
          />
        ))}
      </List>
      <Footer />
    </View>
  )
}

export default SidebarCollapsed
