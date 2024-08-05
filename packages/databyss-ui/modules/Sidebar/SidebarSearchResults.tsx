import React, { useEffect, useRef, useState } from 'react'
import {
  sortEntriesAtoZ,
  filterEntries,
} from '@databyss-org/services/entries/util'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'
import SidebarListItem from '@databyss-org/ui/components/Sidebar/SidebarListItem'
import { Text, View } from '@databyss-org/ui/primitives'
import {
  useBlocksInPages,
  useGroups,
  usePages,
} from '@databyss-org/data/pouchdb/hooks'
import { Source, BlockType, Topic } from '@databyss-org/services/interfaces'
import LoadingFallback from '@databyss-org/ui/components/Notify/LoadingFallback'
import {
  authorsToListItemData,
  pagesToListItemData,
  blocksToListItemData,
} from './transforms'
import { FindInPage, useFindInPage } from '../../hooks/search/useFindInPage'
import { Icon, ListHandle } from '../..'
import FindInPageSvg from '../../assets/find-in-page.svg'
import FindInPagesSvg from '../../assets/find-in-pages.svg'
import { groupsToListItemData } from './lists/GroupList'
import { useAppState } from '@databyss-org/desktop/src/hooks'
import theme, { darkContentTheme } from '../../theming/theme'

const FulltextSearchItem = (props) => (
  <SidebarListItem
    text="Find in notes"
    id="sidebarListItem-entry-search"
    icon={
      <Icon sizeVariant="tiny" color="text.3">
        <FindInPagesSvg />
      </Icon>
    }
    {...props}
  >
    <View>
      {/* <Text variant="uiTextTiny" color="text.3">
        ENTER
      </Text> */}
    </View>
  </SidebarListItem>
)

const FindInPageSearchItem = ({
  findInPage,
  onPress,
  ...props
}: {
  findInPage: FindInPage
  onPress?: () => void
}) => (
  <SidebarListItem
    text="Find in page"
    id="sidebarListItem-findInPage"
    onPress={() => {
      // console.log('[SidebarSearchResults] findNext')
      findInPage.findNext()
      if (onPress) {
        onPress()
      }
    }}
    icon={
      <Icon sizeVariant="tiny" color="text.3">
        <FindInPageSvg />
      </Icon>
    }
    {...props}
  >
    <View>
      {findInPage.matches.length > 0 ? (
        <Text variant="uiTextSmall" color="text.3">
          {findInPage.currentIndex >= 0 ? findInPage.currentIndex + 1 : '-'} /{' '}
          {findInPage.matches.length}
        </Text>
      ) : (
        <Text variant="uiTextTiny" color="text.3">
          no results
        </Text>
      )}
    </View>
  </SidebarListItem>
)

const SidebarSearchResults = ({
  filterQuery,
  height,
  onSearch,
  inputRef,
  searchHasFocus,
  onItemPressed,
  ...others
}) => {
  const sourcesRes = useBlocksInPages<Source>(BlockType.Source, {
    previousIfNull: true,
  })
  const topicsRes = useBlocksInPages<Topic>(BlockType.Topic, {
    previousIfNull: true,
  })
  const groupsRes = useGroups({ previousIfNull: true })
  const pagesRes = usePages({ previousIfNull: true })
  const listHandleRef = useRef<ListHandle>(null)
  const isDarkModeRes = useAppState('darkMode')
  const findInPage = useFindInPage({
    theme: isDarkModeRes.data ? darkContentTheme : theme,
    paused: !searchHasFocus,
    onMatchesUpdated: (matches) => {
      if (!listHandleRef.current) {
        return
      }
      // console.log('[SidebarSearchResults] activeIndex', listHandleRef.current.getActiveIndex())
      const _nextSelectedItem = matches.length === 0 ? 1 : 0
      if (listHandleRef.current.getActiveIndex() <= 1) {
        listHandleRef.current.setActiveIndex(_nextSelectedItem)
      }
    },
  })
  const [orderKey, setOrderKey] = useState<number>(0)
  useEffect(() => {
    if (filterQuery?.trim().length) {
      findInPage.runQuery()
    }
    setOrderKey(orderKey + 1)
  }, [filterQuery])

  const queryRes = [sourcesRes, topicsRes, pagesRes, groupsRes]

  if (queryRes.some((q) => !q.isSuccess)) {
    return <LoadingFallback queryObserver={queryRes} />
  }

  let _menuItems = []

  if (filterQuery?.trim().length > 1) {
    const mappedSources = blocksToListItemData(sourcesRes.data!)
    const mappedTopics = blocksToListItemData(topicsRes.data!)

    const mappedAuthors = authorsToListItemData(Object.values(sourcesRes.data!))
    const mappedGroups = groupsToListItemData(Object.values(groupsRes.data!))
    const mappedPages = pagesToListItemData(
      Object.values(pagesRes.data!)
    ).filter((pageItem) => !pageItem.data?.archive)

    const allResults = [
      ...mappedSources,
      ...mappedPages,
      ...mappedAuthors,
      ...mappedTopics,
      ...mappedGroups,
    ]

    const sorted = sortEntriesAtoZ(allResults, 'text')
    const filtered = filterEntries(sorted, filterQuery)

    _menuItems = filterQuery === '' ? sorted : filtered
  }
  return (
    <SidebarList
      showRecentAllToggle={false}
      data-test-element="search-results"
      heading={_menuItems.length ? 'Quick Matches' : ''}
      menuItems={_menuItems}
      height={height}
      keyboardNavigation
      keyboardEventsActive={document.activeElement === inputRef.current}
      orderKey={orderKey}
      initialActiveIndex={findInPage.matches.length === 0 ? 1 : 0}
      // onItemSelected={() => {
      //   // HACK: replace with an "onLoadersComplete" event
      //   setTimeout(() => {
      //     inputRef.current.focus()
      //   }, 50)
      // }}
      onItemPressed={(item, index) => {
        if (listHandleRef.current) {
          listHandleRef.current.setActiveIndex(index + 1)
        }
        if (onItemPressed) {
          onItemPressed(item, index)
        }
      }}
      borderRightStyle="solid"
      borderRightColor="border.2"
      borderRightWidth={1}
      handlesRef={listHandleRef}
      showSubitemToggles={false}
      {...others}
    >
      <FindInPageSearchItem
        findInPage={findInPage}
        onPress={() => {
          inputRef.current.focus()
        }}
      />
      <FulltextSearchItem
        onPress={() => {
          onSearch()
          listHandleRef.current?.setActiveIndex(0)
        }}
      />
      <View />
    </SidebarList>
  )
}

export default SidebarSearchResults
