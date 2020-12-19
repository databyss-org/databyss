import React from 'react'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { pxUnits } from '@databyss-org/ui/theming/views'
import SourcesSvg from '@databyss-org/ui/assets/sources.svg'
import AuthorsSvg from '@databyss-org/ui/assets/authors.svg'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import ArchiveSvg from '@databyss-org/ui/assets/archive.svg'
import TopicsSvg from '@databyss-org/ui/assets/topics.svg'
import { ScrollView, Icon, List } from '@databyss-org/ui/primitives'
import { useLocation } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import SidebarListItem from '@databyss-org/ui/components/Sidebar/SidebarListItem'

const menuSvgs = (type) =>
  ({
    pages: <PageSvg />,
    sources: <SourcesSvg />,
    authors: <AuthorsSvg />,
    topics: <TopicsSvg />,
    archive: <ArchiveSvg />,
  }[type])

const SidebarList = ({
  menuItems,
  query,
  height,
  children,
  orderKey,
  onActiveItemChanged,
  onActiveIndexChanged,
  initialActiveIndex,
  keyboardNavigation,
  keyboardEventsActive,
  onItemSelected,
  ...others
}) => {
  const { getTokensFromPath, getAccountFromLocation } = useNavigationContext()
  const location = useLocation()
  const tokens = getTokensFromPath()

  const getHref = (item) => {
    const routeWithAccount = `/${getAccountFromLocation()}${item.route}`
    if (item.params) {
      return `${routeWithAccount}${
        query || item.type === 'authors' ? '?' : '/'
      }${item.params}`
    }
    return `${routeWithAccount}`
  }

  const getActiveItem = (item) => {
    // if we're using keyboard navigation, that takes precedence
    if (keyboardNavigation && keyboardEventsActive) {
      return false
    }
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

  return (
    <ScrollView height={height} flexShrink={1} {...others}>
      <List
        orderKey={orderKey}
        onActiveItemChanged={onActiveItemChanged}
        onActiveIndexChanged={onActiveIndexChanged}
        initialActiveIndex={initialActiveIndex}
        keyboardNavigation={keyboardNavigation}
        keyboardEventsActive={keyboardEventsActive}
        onItemSelected={onItemSelected}
      >
        {children}
        {menuItems.map((item, index) => {
          if (item.text) {
            return (
              <SidebarListItem
                isActive={getActiveItem(item)}
                text={item.text}
                href={getHref(item)}
                key={`${item.type}-${index}`}
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
      </List>
    </ScrollView>
  )
}

export default SidebarList
