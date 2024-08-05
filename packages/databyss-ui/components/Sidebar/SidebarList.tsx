import React, {
  PropsWithChildren,
  ReactNode,
  Ref,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react'
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
import MediaSvg from '@databyss-org/ui/assets/play.svg'
import GroupSvg from '@databyss-org/ui/assets/folder-closed.svg'
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
import { unorm } from '@databyss-org/data/couchdb/couchdb'
import { SidebarHeaderButton } from './SidebarHeaderButton'
import { ListHandle } from '../..'

export interface SidebarListProps
  extends ScrollViewProps,
    KeyboardNavigationProps {
  menuItems: SidebarListItemData<any>[]
  keyboardNavigation?: boolean
  heading?: string
  prependItems?: SidebarListItemData<any>[]
  handlesRef?: Ref<ListHandle>
  showSubitemToggles?: boolean
  onItemPressed?: (item: SidebarListItemData, index: number) => void
  showRecentAllToggle?: boolean
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
  embed: <MediaSvg />,
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
  handlesRef,
  showSubitemToggles,
  onItemPressed,
  showRecentAllToggle,
  ...others
}: PropsWithChildren<SidebarListProps>) => {
  const {
    getAccountFromLocation,
    navigate,
    getSidebarPath,
  } = useNavigationContext()
  const location = useLocation()
  const account = getAccountFromLocation(true)
  const [showAll, setShowAll] = useState<boolean>(!showRecentAllToggle)
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])
  const scrollViewRef = useRef<any | null>(null)
  const getHref = (item: SidebarListItemData) => `/${account}${item.route}`

  const getActiveItem = (item: SidebarListItemData) => {
    // if we're using keyboard navigation, that takes precedence
    if (keyboardNavigation && keyboardEventsActive) {
      return false
    }
    const _hrefRoute = unorm(getHref(item))
    const _hrefCurrent = unorm(
      `${decodeURI(location.pathname)}${
        location.search ? `${location.search}` : ''
      }`
    )
    // ignore differences in nice url by excluding last segment
    const denicePath = (path: string) => {
      const parts = path.split('/')
      return parts.length > 4 ? parts.slice(0, -1).join('/') : path
    }
    // console.log(
    //   '[SidebarList]',
    //   denicePath(_hrefRoute),
    //   denicePath(_hrefCurrent)
    // )
    return denicePath(_hrefRoute) === denicePath(_hrefCurrent)
  }

  const getDraggable = (item: SidebarListItemData<any>) => {
    const sidebarPath = getSidebarPath()
    if (!(sidebarPath === 'group' && item.type === 'page')) {
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
  const _pressItem = (
    item: SidebarListItemData,
    index: number,
    event: Event
  ) => {
    if (onItemPressed) {
      onItemPressed(item, index)
    }
    if (!showAll && scrollViewRef.current && item.type !== 'author') {
      // scrollViewRef.current.scrollTop = 0
      // sorry for this jquery hack!
      setTimeout(() => event.target.closest('a').blur(), 50)
    }
  }
  const _pressSelector = (item: SidebarListItemData, index: number) => ({
    ...(account
      ? {
          href: getHref(item),
          onPress: (event) => _pressItem(item, index, event),
        }
      : {
          onPress: (event) => {
            _pressItem(item, index, event)
            navigate(item.route)
          },
        }),
  })

  let _menuItems = [...menuItems]
  const recentSidebarItemLimit = parseInt(process.env.RECENT_SIDEBAR_ITEMS!, 10)
  if (!showAll && _menuItems.length > recentSidebarItemLimit) {
    _menuItems = sortEntriesByRecent(menuItems, 'data')
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
        ...(showRecentAllToggle &&
        (showAll || _menuItems.length < menuItems.length)
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

  const onExpandItem = useCallback(
    (evt: Event, id: string) => {
      evt.preventDefault()
      if (!expandedGroups.includes(id)) {
        setExpandedGroups(expandedGroups.concat(id))
      } else {
        setExpandedGroups(expandedGroups.filter((g) => g !== id))
      }
    },
    [expandedGroups]
  )

  const _expandedMenuItems: SidebarListItemData[] = []
  _menuItems.forEach((_item) => {
    _expandedMenuItems.push({ ..._item, depth: 0 })
    if (_item.subItems && expandedGroups.includes(_item.data._id)) {
      _item.subItems.forEach((_subItem, _subIndex) => {
        _expandedMenuItems.push({ ..._subItem, depth: 1 })
      })
    }
  })

  return (
    <ScrollView
      height={height}
      flexShrink={1}
      flexGrow={1}
      {...others}
      my={0}
      ref={scrollViewRef}
      // shadowOnScroll
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
        handlesRef={handlesRef}
      >
        {children}
        {useMemo(
          () =>
            _expandedMenuItems.map((item, index) => {
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
                    <Text
                      variant="uiTextHeading"
                      color="text.2"
                      userSelect="none"
                    >
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
              let _icon = item.icon ? item.icon : menuSvgs[item.type]
              if (item.depth) {
                _icon = <View p={pxUnits(1)}>{_icon}</View>
              }
              return (
                <SidebarListItem
                  depth={item.depth}
                  isActive={getActiveItem(item)}
                  data={item.data}
                  text={item.text}
                  href={getHref(item)}
                  key={`${item.type}-${index}`}
                  draggable={getDraggable(item)}
                  icon={_icon}
                  iconColor={item.iconColor}
                  expandable={showSubitemToggles && item.type === 'group'}
                  onExpand={(evt) => onExpandItem(evt, item.data._id)}
                  expanded={
                    item.subItems && expandedGroups.includes(item.data._id)
                  }
                  contextMenu={item.contextMenu}
                  dropzone={item.isDropzone ? item.dropzoneProps : undefined}
                  keyboardEventsActive={keyboardEventsActive}
                  {..._pressSelector(item, index)}
                />
              )
            }),
          [_expandedMenuItems]
        )}
      </List>
    </ScrollView>
  )
}

SidebarList.defaultProps = {
  height: '100%',
  showSubitemToggles: true,
  showRecentAllToggle: true,
}

export default SidebarList
