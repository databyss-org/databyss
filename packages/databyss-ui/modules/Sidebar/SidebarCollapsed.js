import React, { useState, useEffect } from 'react'
import css from '@styled-system/css'
import { View, List } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import PagesSvg from '@databyss-org/ui/assets/pages.svg'
import SearchSvg from '@databyss-org/ui/assets/search.svg'
import MenuSvg from '@databyss-org/ui/assets/menu.svg'
import { pxUnits } from '@databyss-org/ui/theming/views'
import SidebarIconButton, {
  sideBarIconBtnHeight,
} from '@databyss-org/ui/components/Sidebar/SidebarIconButton'
import Footer from '@databyss-org/ui/components/Sidebar/Footer'
import { darkTheme } from '../../theming/theme'

export const defaultProps = {
  height: '100vh',
}

export const sidebarCollapsedWidth = 56

const SidebarCollapsed = () => {
  const {
    navigateSidebar,
    getTokensFromPath,
    getSidebarPath,
    isMenuOpen,
    setMenuOpen,
  } = useNavigationContext()

  const [activeItem, setActiveItem] = useState('pages')

  const onItemClick = item => {
    if (activeItem === item) {
      return setMenuOpen(!isMenuOpen)
    }
    if (!isMenuOpen) {
      return (
        setMenuOpen(true) && navigateSidebar(`/${item}`) && setActiveItem(item)
      )
    }
    return navigateSidebar(`/${item}`) && setActiveItem(item)
  }

  useEffect(
    () =>
      setActiveItem(
        getSidebarPath() ? getSidebarPath() : getTokensFromPath().type
      ),
    [navigateSidebar]
  )

  const sideBarCollapsedItems = [
    {
      name: 'menuCollapse',
      title: 'Collapse menu',
      icon: <MenuSvg />,
      onClick: () => setMenuOpen(!isMenuOpen),
    },
    {
      name: 'search',
      title: 'Search',
      icon: <SearchSvg />,
      onClick: () => onItemClick('search'),
    },
    {
      name: 'pages',
      title: 'Pages',
      icon: <PagesSvg />,
      onClick: () => onItemClick('pages'),
    },
  ]

  const getBorderPosition = itemName => {
    const itemIndex = sideBarCollapsedItems
      .map(item => item.name)
      .indexOf(itemName)
    const startPosition = 12

    return startPosition + itemIndex * sideBarIconBtnHeight
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
            title={item.title}
            icon={item.icon}
            isActive={activeItem === item.name}
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
