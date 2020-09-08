import React from 'react'
import { useLocation } from '@reach/router'

import { pxUnits } from '@databyss-org/ui/theming/views'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { View, Icon } from '@databyss-org/ui/primitives'
import SidebarListItem from '@databyss-org/ui/components/Sidebar/SidebarListItem'

import AuthorsSvg from '@databyss-org/ui/assets/authors.svg'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import SourcesSvg from '@databyss-org/ui/assets/sources.svg'
import TopicsSvg from '@databyss-org/ui/assets/topics.svg'

import { isMobile } from '../../lib/mediaQuery'

const menuSvgs = type =>
  ({
    pages: <PageSvg />,
    sources: <SourcesSvg />,
    authors: <AuthorsSvg />,
    topics: <TopicsSvg />,
  }[type])

const SidebarList = ({ menuItems, query, height, ...others }) => {
  const { getTokensFromPath, isMenuOpen, setMenuOpen } = useNavigationContext()
  const location = useLocation()
  const tokens = getTokensFromPath()

  const getHref = item => {
    if (item.params) {
      return `${item.route}${query || item.type === 'authors' ? '?' : '/'}${
        item.params
      }`
    }
    return `${item.route}`
  }

  const getActiveItem = item => {
    // For authors the url structure changes to query parameters separated by '?'
    if (location.search) {
      return `?${item.params}` === location.search
    }
    // For topics, pages, and search, the url is separated by id or search param with a '/'
    if (item.params) {
      return item.params === tokens.params
    }
    // For index pages
    if (!location.search) {
      return item.route === location.pathname
    }
    return false
  }

  const onItemPress = () => {
    if (isMenuOpen && isMobile()) {
      setMenuOpen(false)
    }
  }

  return (
    <View
      width="100%"
      height={height}
      overflow="scroll"
      p={pxUnits(0)}
      {...others}
    >
      {menuItems.map((item, index) => {
        if (item.text) {
          return (
            <SidebarListItem
              isActive={getActiveItem(item)}
              text={item.text}
              href={getHref(item)}
              key={`${item.type}-${index}`}
              index={index}
              onPress={onItemPress}
              icon={
                <Icon
                  sizeVariant="tiny"
                  color={getActiveItem(item) ? 'text.1' : 'text.3'}
                  mt={pxUnits(2)}
                >
                  {item.icon ? item.icon : menuSvgs(item.type)}
                </Icon>
              }
            />
          )
        }
        return null
      })}
    </View>
  )
}

export default SidebarList
