import React from 'react'
import { useNavigationContext } from '@databyss-org/ui/components'
import { pxUnits } from '@databyss-org/ui/theming/views'
import SourcesSvg from '@databyss-org/ui/assets/sources.svg'
import AuthorsSvg from '@databyss-org/ui/assets/authors.svg'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import ArchiveSvg from '@databyss-org/ui/assets/archive.svg'
import TopicsSvg from '@databyss-org/ui/assets/topics.svg'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
import SourceSvg from '@databyss-org/ui/assets/source.svg'
import TopicSvg from '@databyss-org/ui/assets/topic.svg'
import GroupSvg from '@databyss-org/ui/assets/logo-thick.svg'
import { ScrollView, Icon, List, View, Text } from '@databyss-org/ui/primitives'
import { useLocation } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import SidebarListItem from '@databyss-org/ui/components/Sidebar/SidebarListItem'

const menuSvgs = (type) =>
  ({
    page: <PageSvg />,
    sources: <SourcesSvg />,
    source: <SourceSvg />,
    author: <AuthorSvg />,
    authors: <AuthorsSvg />,
    topic: <TopicSvg />,
    topics: <TopicsSvg />,
    archive: <ArchiveSvg />,
    group: <GroupSvg />,
  }[type])

const SidebarList = ({
  menuItems,
  query,
  height,
  children,
  orderKey,
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

  const canDrag = (item) =>
    item.type === 'page' && location.pathname.match(/\/collection\//)

  return (
    <ScrollView
      height={height}
      flexShrink={1}
      flexGrow={1}
      {...others}
      mt="tiny"
      mb={0}
      shadowOnScroll
    >
      <List
        orderKey={orderKey}
        onActiveIndexChanged={onActiveIndexChanged}
        initialActiveIndex={initialActiveIndex}
        keyboardNavigation={keyboardNavigation}
        keyboardEventsActive={keyboardEventsActive}
        onItemSelected={onItemSelected}
        py={0}
      >
        {children}
        {menuItems.map((item, index) => {
          if (!item.text) {
            return null
          }
          if (item.type === 'heading') {
            return (
              <View
                pl="em"
                pt={index ? 'em' : 'small'}
                pb="small"
                key={item.text}
              >
                <Text variant="uiTextHeading" color="text.3">
                  {item.text}
                </Text>
              </View>
            )
          }
          return (
            <SidebarListItem
              isActive={getActiveItem(item)}
              text={item.text}
              href={getHref(item)}
              key={`${item.type}-${index}`}
              draggable={canDrag(item)}
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
        })}
      </List>
    </ScrollView>
  )
}

SidebarList.defaultProps = {
  height: '100%',
}

export default SidebarList
