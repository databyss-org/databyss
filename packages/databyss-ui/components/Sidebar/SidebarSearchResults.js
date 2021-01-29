import React from 'react'
import {
  sortEntriesAtoZ,
  filterEntries,
} from '@databyss-org/services/entries/util'
import {
  getAuthorData,
  getSourceTitlesData,
} from '@databyss-org/ui/modules/Sidebar/routes/Sources'
import { getPagesData } from '@databyss-org/ui/modules/Sidebar/routes/Pages'
import { getTopicsData } from '@databyss-org/ui/modules/Sidebar/routes/Topics'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'
import SidebarListItem from '@databyss-org/ui/components/Sidebar/SidebarListItem'
import { iconSizeVariants } from '@databyss-org/ui/theming/icons'
import { Text, View } from '@databyss-org/ui/primitives'
import {
  useBlockRelations,
  useBlocks,
  usePages,
} from '@databyss-org/data/pouchdb/hooks'
import { BlockType } from '@databyss-org/editor/interfaces'
import LoadingFallback from '@databyss-org/ui/components/Notify/LoadingFallback'
import { joinBlockRelationsWithBlocks } from '@databyss-org/services/blocks'
import { getAuthorsFromSources } from '@databyss-org/services/lib/util'

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
}) => {
  const sourcesRes = useBlocks(BlockType.Source)
  const topicsRes = useBlocks(BlockType.Topic)
  const blockRelationsRes = useBlockRelations()
  const pagesRes = usePages()

  if (
    !(
      sourcesRes.isSuccess &&
      topicsRes.isSuccess &&
      blockRelationsRes.isSuccess &&
      pagesRes.isSuccess
    )
  ) {
    return <LoadingFallback />
  }

  const sources = joinBlockRelationsWithBlocks(
    blockRelationsRes.data,
    sourcesRes.data
  )
  const topics = joinBlockRelationsWithBlocks(
    blockRelationsRes.data,
    topicsRes.data
  )
  const authors = getAuthorsFromSources(sources)
  const pages = pagesRes.data

  const sourceTitlesData = getSourceTitlesData(sources)
  const authorsData = getAuthorData(authors)
  const topicsData = getTopicsData(topics)
  const pagesData = getPagesData(pages)

  const allResults = [
    ...sourceTitlesData,
    ...pagesData,
    ...authorsData,
    ...topicsData,
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
    >
      <FulltextSearchItem onPress={onSearch} />
    </SidebarList>
  )
}

export default SidebarSearchResults
