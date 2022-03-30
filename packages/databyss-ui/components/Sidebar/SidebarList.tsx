import React, { PropsWithChildren, ReactNode } from 'react'
import {
  SidebarListItemData,
  useNavigationContext,
} from '@databyss-org/ui/components'
import SourcesSvg from '@databyss-org/ui/assets/sources.svg'
import AuthorsSvg from '@databyss-org/ui/assets/authors.svg'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import ArchiveSvg from '@databyss-org/ui/assets/archive.svg'
import TopicsSvg from '@databyss-org/ui/assets/topics.svg'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
import SourceSvg from '@databyss-org/ui/assets/source.svg'
import TopicSvg from '@databyss-org/ui/assets/topic.svg'
import GroupSvg from '@databyss-org/ui/assets/logo-thick.svg'
import {
  ScrollView,
  List,
  View,
  Text,
  ScrollViewProps,
  KeyboardNavigationProps,
} from '@databyss-org/ui/primitives'
import { useLocation } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import SidebarListItem from '@databyss-org/ui/components/Sidebar/SidebarListItem'

export interface SidebarListProps
  extends ScrollViewProps,
    KeyboardNavigationProps {
  menuItems: SidebarListItemData<any>[]
  keyboardNavigation?: boolean
}

const menuSvgs: { [key: string]: ReactNode } = {
  page: <PageSvg />,
  sources: <SourcesSvg />,
  source: <SourceSvg />,
  author: <AuthorSvg />,
  authors: <AuthorsSvg />,
  topic: <TopicSvg />,
  topics: <TopicsSvg />,
  archive: <ArchiveSvg />,
  group: <GroupSvg />,
}

const SidebarList = ({
  menuItems,
  height,
  children,
  orderKey,
  onActiveIndexChanged,
  initialActiveIndex,
  keyboardNavigation,
  keyboardEventsActive,
  onItemSelected,
  ...others
}: PropsWithChildren<SidebarListProps>) => {
  const { getAccountFromLocation, navigate } = useNavigationContext()
  const location = useLocation()
  const account = getAccountFromLocation(true)

  const getHref = (item: SidebarListItemData<any>) => `/${account}${item.route}`

  const getActiveItem = (item: SidebarListItemData<any>) => {
    // if we're using keyboard navigation, that takes precedence
    if (keyboardNavigation && keyboardEventsActive) {
      return false
    }
    return getHref(item) === location.pathname + location.search
      ? `?${location.search}`
      : ''
  }

  const getDraggable = (item: SidebarListItemData<any>) => {
    if (item.type !== 'page' || !location.pathname.match(/\/collections\//)) {
      return false
    }
    return {
      type: 'PAGE',
      // payload type is PageHeader
      payload: item.data,
    }
  }

  /**
   *
   * @param item if valid accountID is not provided, use navigate instead of href for BaseControl
   */
  const _pressSelector = (item) => ({
    ...(account
      ? { href: getHref(item) }
      : { onPress: () => navigate(item.route) }),
  })

  return (
    <ScrollView
      height={height}
      flexShrink={1}
      flexGrow={1}
      {...others}
      my={0}
      shadowOnScroll
    >
      <List
        orderKey={orderKey}
        onActiveIndexChanged={onActiveIndexChanged}
        initialActiveIndex={initialActiveIndex}
        keyboardNavigation={keyboardNavigation}
        keyboardEventsActive={keyboardEventsActive}
        horizontalItemPadding="em"
        verticalItemMargin="tiny"
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
                <Text variant="uiTextHeading" color="text.3" userSelect="none">
                  {item.text}
                </Text>
              </View>
            )
          }
          return (
            <SidebarListItem
              isActive={getActiveItem(item)}
              text={item.text}
              // href={getHref(item)}
              key={`${item.type}-${index}`}
              draggable={getDraggable(item)}
              icon={item.icon ? item.icon : menuSvgs[item.type]}
              iconColor={item.iconColor}
              {..._pressSelector(item)}
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
