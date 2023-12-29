import React, { useEffect, useRef } from 'react'
import {
  sortEntriesAtoZ,
  filterEntries,
} from '@databyss-org/services/entries/util'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'
import SidebarListItem from '@databyss-org/ui/components/Sidebar/SidebarListItem'
import { iconSizeVariants } from '@databyss-org/ui/theming/icons'
import { Text, View } from '@databyss-org/ui/primitives'
import { useBlocksInPages, usePages } from '@databyss-org/data/pouchdb/hooks'
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
          {findInPage.currentIndex >= 0 ? findInPage.currentIndex + 1 : '-'} / {findInPage.matches.length}
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
  ...others
}) => {
  const sourcesRes = useBlocksInPages<Source>(BlockType.Source)
  const topicsRes = useBlocksInPages<Topic>(BlockType.Topic)
  const pagesRes = usePages()
  const listHandleRef = useRef<ListHandle>(null)
  const findInPage = useFindInPage({
    paused: !searchHasFocus,
    onMatchesUpdated: (matches) => {
      if (!listHandleRef.current) {
        return
      }
      const _nextSelectedItem = matches.length === 0 ? 1 : 0
      if (listHandleRef.current.getActiveIndex() <= 1) {
        listHandleRef.current.setActiveIndex(_nextSelectedItem)
      }
    },
  })

  useEffect(() => {
    if (filterQuery?.trim().length) {
      findInPage.runQuery()
    }
  }, [filterQuery])

  const queryRes = [sourcesRes, topicsRes, pagesRes]

  if (queryRes.some((q) => !q.isSuccess)) {
    return <LoadingFallback queryObserver={queryRes} />
  }

  const mappedSources = blocksToListItemData(sourcesRes.data!)
  const mappedTopics = blocksToListItemData(topicsRes.data!)

  const mappedAuthors = authorsToListItemData(Object.values(sourcesRes.data!))

  const mappedPages = pagesToListItemData(Object.values(pagesRes.data!))

  const allResults = [
    ...mappedSources,
    ...mappedPages,
    ...mappedAuthors,
    ...mappedTopics,
  ]

  const sortedSources = sortEntriesAtoZ(allResults, 'text')

  const filteredEntries = filterEntries(sortedSources, filterQuery)

  const _menuItems = filterQuery === '' ? sortedSources : filteredEntries
  return (
    <SidebarList
      // key={filterQuery}
      data-test-element="search-results"
      heading={_menuItems.length ? 'Quick Matches' : ''}
      menuItems={_menuItems}
      height={height}
      keyboardNavigation
      keyboardEventsActive={searchHasFocus}
      orderKey={filterQuery}
      initialActiveIndex={findInPage.matches.length === 0 ? 1 : 0}
      onItemSelected={() => {
        // HACK: replace with an "onLoadersComplete" event
        setTimeout(() => {
          inputRef.current.focus()
        }, 50)
      }}
      handlesRef={listHandleRef}
      {...others}
    >
      <FindInPageSearchItem findInPage={findInPage} onPress={() => {
        inputRef.current.focus()
      }} />
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
