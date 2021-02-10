import React from 'react'
import {
  sortEntriesAtoZ,
  filterEntries,
} from '@databyss-org/services/entries/util'
import { getBlocksInPages } from '@databyss-org/services/blocks/joins'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'
import SidebarListItem from '@databyss-org/ui/components/Sidebar/SidebarListItem'
import { iconSizeVariants } from '@databyss-org/ui/theming/icons'
import { Text, View } from '@databyss-org/ui/primitives'
import {
  useBlockRelations,
  useBlocks,
  usePages,
} from '@databyss-org/data/pouchdb/hooks'
import { Source, BlockType } from '@databyss-org/services/interfaces'
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
  const sourcesRes = useBlocks(BlockType.Source)
  const topicsRes = useBlocks(BlockType.Topic)
  const blockRelationsRes = useBlockRelations()
  const pagesRes = usePages()

  const queryRes = [sourcesRes, topicsRes, blockRelationsRes, pagesRes]

  if (queryRes.some((q) => !q.isSuccess)) {
    return <LoadingFallback queryObserver={queryRes} />
  }

  const mappedSources = blocksToListItemData(
    getBlocksInPages(
      blockRelationsRes.data!,
      sourcesRes.data!,
      pagesRes.data!,
      false
    )
  )

  const mappedTopics = blocksToListItemData(
    getBlocksInPages(
      blockRelationsRes.data!,
      topicsRes.data!,
      pagesRes.data!,
      false
    )
  )

  const mappedAuthors = authorsToListItemData(
    Object.values(sourcesRes.data!) as Source[]
  )

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
      menuItems={[
        ...(filterQuery.textValue === '' ? sortedSources : filteredEntries),
      ]}
      height={height}
      keyboardNavigation
      keyboardEventsActive={searchHasFocus}
      orderKey={filterQuery.textValue}
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
    </SidebarList>
  )
}

export default SidebarSearchResults
