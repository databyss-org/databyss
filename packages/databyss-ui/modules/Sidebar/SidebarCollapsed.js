import React, { useState, useEffect } from 'react'
import { View, List } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import PagesSvg from '@databyss-org/ui/assets/pages.svg'
import SearchSvg from '@databyss-org/ui/assets/search.svg'
import MenuSvg from '@databyss-org/ui/assets/menu.svg'
import { pxUnits } from '@databyss-org/ui/theming/views'
import SidebarIconButton from '@databyss-org/ui/components/Sidebar/SidebarIconButton'
import Footer from '@databyss-org/ui/components/Sidebar/Footer'
import { darkTheme } from '../../theming/theme'
import { sidebar } from '../../theming/components'

export const defaultProps = {
  height: '100vh',
}

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
    if (!isMenuOpen) {
      return (
        setMenuOpen(true) && navigateSidebar(`/${item}`) && setActiveItem(item)
      )
    }
    return activeItem === item
      ? setMenuOpen(!isMenuOpen)
      : navigateSidebar(`/${item}`) && setActiveItem(item)
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

    return startPosition + itemIndex * sidebar.iconBtnHeight
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
      width={sidebar.collapsedWidth}
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
