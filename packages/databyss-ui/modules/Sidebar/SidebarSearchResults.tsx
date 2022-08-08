import React from 'react'
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

const FulltextSearchItem = (props) => (
  <SidebarListItem
    text="Find in notes"
    id="sidebarListItem-entry-search"
    icon={
      <View
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        width={iconSizeVariants.tiny.width}
      >
        <Text variant="uiTextTiny" color="text.3">
          A
        </Text>
        <Text variant="uiTextTinyItalic" color="text.3">
          a
        </Text>
      </View>
    }
    {...props}
  >
    <View>
      <Text variant="uiTextTiny" color="text.3">
        ENTER
      </Text>
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

  return (
    <SidebarList
      data-test-element="search-results"
      heading="Quick Matches"
      menuItems={filterQuery === '' ? sortedSources : filteredEntries}
      height={height}
      keyboardNavigation
      keyboardEventsActive={searchHasFocus}
      orderKey={filterQuery}
      initialActiveIndex={0}
      onItemSelected={() => {
        // HACK: replace with an "onLoadersComplete" event
        setTimeout(() => {
          inputRef.current.focus()
        }, 50)
      }}
      {...others}
    >
      <FulltextSearchItem onPress={onSearch} />
      <View />
    </SidebarList>
  )
}

export default SidebarSearchResults
