import React from 'react'
import { useEntryContext } from '@databyss-org/services/entries/EntryProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { Text, View } from '@databyss-org/ui/primitives'
import SearchInputContainer from '@databyss-org/ui/components/SearchContent/SearchInputContainer'
import Pages from '@databyss-org/ui/modules/Sidebar/routes/Pages'
import Sources from '@databyss-org/ui/modules/Sidebar/routes/Sources'
import Topics from '@databyss-org/ui/modules/Sidebar/routes/Topics'
import { sidebarListHeight } from '@databyss-org/ui/modules/Sidebar/Sidebar'
import SidebarListItem from '@databyss-org/ui/components/Sidebar/SidebarListItem'
import { iconSizeVariants } from '@databyss-org/ui/theming/icons'

const Search = ({ onClick }) => {
  const { navigate, getSidebarPath } = useNavigationContext()

  const { searchTerm, setQuery, clearSearchCache } = useEntryContext()
  const menuItem = getSidebarPath()

  const clear = () => {
    clearSearchCache()
    setQuery({ textValue: '' })
  }

  const onChange = val => {
    setQuery(val)
  }

  const onSearchClick = () => {
    // encode the search term and remove '?'
    navigate(`/search/${encodeURI(searchTerm.replace(/\?/g, ''))}`)
  }

  return (
    <SearchInputContainer
      placeholder="Search"
      value={{ textValue: searchTerm }}
      onChange={onChange}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          onSearchClick()
        }
      }}
      onClear={clear}
      onClick={onClick}
      autoFocus={menuItem === 'search'}
    >
      {searchTerm &&
        menuItem === 'search' && (
          <View
            height={sidebarListHeight}
            pt="medium"
            pb="medium"
            overflow="scroll"
          >
            <SidebarListItem
              onPress={onSearchClick}
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
            >
              <View>
                <Text variant="uiTextTiny" color="text.3">
                  ENTER
                </Text>
              </View>
            </SidebarListItem>
            <Pages
              filterQuery={{ textValue: searchTerm }}
              LoadingFallback={false}
            />
            <Sources
              filterQuery={{ textValue: searchTerm }}
              LoadingFallback={false}
            />
            <Topics
              filterQuery={{ textValue: searchTerm }}
              LoadingFallback={false}
            />
          </View>
        )}
    </SearchInputContainer>
  )
}

export default Search
