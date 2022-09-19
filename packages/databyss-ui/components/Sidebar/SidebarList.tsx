import React, { PropsWithChildren, ReactNode, useState } from 'react'
import {
  SidebarListItemData,
  useNavigationContext,
} from '@databyss-org/ui/components'
import {
  sortEntriesAtoZ,
  sortEntriesByRecent,
} from '@databyss-org/services/entries/util'
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
import { pxUnits } from '@databyss-org/ui/theming/views'
import { unorm } from '@databyss-org/data/couchdb-client/couchdb'
import { SidebarHeaderButton } from './SidebarHeaderButton'

export interface SidebarListProps
  extends ScrollViewProps,
    KeyboardNavigationProps {
  menuItems: SidebarListItemData<any>[]
  keyboardNavigation?: boolean
  heading?: string
  prependItems?: SidebarListItemData<any>[]
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
  heading,
  prependItems,
  ...others
}: PropsWithChildren<SidebarListProps>) => {
  const { getAccountFromLocation, navigate } = useNavigationContext()
  const location = useLocation()
  const account = getAccountFromLocation(true)
  const [showAll, setShowAll] = useState<boolean>(false)

  const getHref = (item: SidebarListItemData<any>) => `/${account}${item.route}`

  const getActiveItem = (item: SidebarListItemData<any>) => {
    // if we're using keyboard navigation, that takes precedence
    if (keyboardNavigation && keyboardEventsActive) {
      return false
    }
    const _hrefRoute = unorm(getHref(item))
    const _hrefCurrent = unorm(
      `${decodeURI(location.pathname)}${
        location.search ? `?${location.search}` : ''
      }`
    )
    // console.log('[SidebarList]', _hrefCurrent, _hrefRoute)
    return _hrefRoute === _hrefCurrent
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

  let _menuItems = [...menuItems]
  const recentSidebarItemLimit = parseInt(process.env.RECENT_SIDEBAR_ITEMS!, 10)
  if (!showAll && _menuItems.length > recentSidebarItemLimit) {
    _menuItems = sortEntriesByRecent(menuItems, 'data')
    // _menuItems = _menuItems.sort(
    //   (a, b) =>
    //     (b.data?.accessedAt ?? b.data?.modifiedAt ?? b.data?.createdAt) -
    //     (a.data?.accessedAt ?? a.data?.modifiedAt ?? a.data?.createdAt)
    // )
    _menuItems = _menuItems.slice(
      0,
      Math.min(recentSidebarItemLimit, _menuItems.length)
    )
  } else {
    _menuItems = sortEntriesAtoZ(_menuItems, 'text')
  }
  if (prependItems) {
    _menuItems = [...prependItems, ..._menuItems]
  }

  if (heading) {
    _menuItems = [
      {
        text: heading,
        type: 'heading',
        ...(showAll || _menuItems.length < menuItems.length
          ? {
              links: [
                {
                  label: 'recent',
                  active: !showAll,
                  onPress: () => setShowAll(false),
                },
                {
                  label: 'all',
                  active: showAll,
                  onPress: () => setShowAll(true),
                },
              ],
            }
          : {}),
      },
      ..._menuItems,
    ]
  }

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
        {_menuItems.map((item, index) => {
          if (!item.text) {
            return null
          }
          if (item.type === 'heading') {
            return (
              <View
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                pl="em"
                pr="small"
                pt={index ? 'em' : 'small'}
                pb="small"
                key={item.text}
              >
                <Text variant="uiTextHeading" color="text.2" userSelect="none">
                  {item.text}
                </Text>
                <View flexDirection="row" minHeight={pxUnits(20)}>
                  {item.links &&
                    item.links.map((link) => (
                      <SidebarHeaderButton
                        key={`shb-${link.label}`}
                        label={link.label}
                        ml="tiny"
                        active={link.active}
                        onPress={link.onPress}
                      />
                    ))}
                </View>
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
