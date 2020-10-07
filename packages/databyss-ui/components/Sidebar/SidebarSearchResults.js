import React from 'react'
import { SearchAllLoader } from '@databyss-org/ui/components/Loaders'
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
import { Text, View, ScrollView, List } from '@databyss-org/ui/primitives'

const FulltextSearchItem = props => (
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
}) => (
  <SearchAllLoader filtered>
    {results => {
      const sourceTitlesData = getSourceTitlesData(results[0])
      const authorsData = getAuthorData(results[1])
      const topicsData = getTopicsData(results[2])
      const pagesData = getPagesData(results[3])

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
    }}
  </SearchAllLoader>
)

export default SidebarSearchResults
