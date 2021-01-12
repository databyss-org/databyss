import React, { useState, useEffect } from 'react'
import { View, List } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import PagesSvg from '@databyss-org/ui/assets/pages.svg'
import SearchSvg from '@databyss-org/ui/assets/search.svg'
import TopicSvg from '@databyss-org/ui/assets/topic.svg'
import SourceSvg from '@databyss-org/ui/assets/source.svg'
import ArchiveSvg from '@databyss-org/ui/assets/archive.svg'
import GroupsImg from '@databyss-org/ui/assets/logo-thick.png'
import { pxUnits } from '@databyss-org/ui/theming/views'
import SidebarIconButton from '@databyss-org/ui/components/Sidebar/SidebarIconButton'
import Footer from '@databyss-org/ui/components/Sidebar/Footer'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { darkTheme } from '../../theming/theme'
import { sidebar } from '../../theming/components'

export const defaultProps = {}

const SidebarCollapsed = () => {
  const {
    navigateSidebar,
    getSidebarPath,
    isMenuOpen,
    setMenuOpen,
  } = useNavigationContext()
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)
  const activeItem = getSidebarPath()

  const onItemClick = (item) => {
    if (!isMenuOpen) {
      return setMenuOpen(true) && navigateSidebar(`/${item}`)
    }
    return activeItem === item
      ? setMenuOpen(!isMenuOpen)
      : navigateSidebar(`/${item}`)
  }

  const isIconButtonActive = (item) => activeItem === item.name && isMenuOpen

  const sideBarCollapsedItems = [
    {
      name: 'groups',
      title: 'Collections',
      icon: <img src={GroupsImg} />,
      sizeVariant: 'large',
      onClick: () => onItemClick('groups'),
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
    {
      name: 'sources',
      title: 'Sources',
      icon: <SourceSvg />,
      onClick: () => onItemClick('sources'),
    },
    {
      name: 'topics',
      title: 'Topics',
      icon: <TopicSvg />,
      onClick: () => onItemClick('topics'),
    },
  ]

  if (!isPublicAccount()) {
    sideBarCollapsedItems.push({
      name: 'archive',
      title: 'Archive',
      icon: <ArchiveSvg />,
      onClick: () => {
        onItemClick('archive')
      },
    })
  }

  return (
    <View
      {...defaultProps}
      theme={darkTheme}
      bg="background.1"
      borderRightColor="border.1"
      borderRightWidth={pxUnits(1)}
      width={sidebar.collapsedWidth}
    >
      <List
        verticalItemPadding={2}
        horizontalItemPadding={1}
        py="none"
        flexGrow={1}
      >
        {sideBarCollapsedItems.map((item, i) => (
          <SidebarIconButton
            name={item.name}
            key={item.name}
            title={item.title}
            icon={item.icon}
            isActive={isIconButtonActive(item)}
            onClick={item.onClick}
            seperatorTop={
              sideBarCollapsedItems.length === i + 1 && !isPublicAccount()
            }
          />
        ))}
      </List>
      <Footer collapsed />
    </View>
  )
}

export default SidebarCollapsed
