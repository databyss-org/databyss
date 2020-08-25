import React, { useEffect, useCallback, useState, useRef } from 'react'
import { useEntryContext } from '@databyss-org/services/entries/EntryProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { Text, View } from '@databyss-org/ui/primitives'
import SearchInputContainer from '@databyss-org/ui/components/SearchContent/SearchInputContainer'
import Pages from '@databyss-org/ui/modules/Sidebar/routes/Pages'
import Authors, {
  SourceTitles,
} from '@databyss-org/ui/modules/Sidebar/routes/Sources'
import { debounce } from 'lodash'
import Topics from '@databyss-org/ui/modules/Sidebar/routes/Topics'
import { sidebarListHeight } from '@databyss-org/ui/modules/Sidebar/Sidebar'
import SidebarListItem from '@databyss-org/ui/components/Sidebar/SidebarListItem'
import { iconSizeVariants } from '@databyss-org/ui/theming/icons'

const Search = ({ onClick }) => {
  const {
    navigate,
    navigateSidebar,
    getSidebarPath,
    getTokensFromPath,
  } = useNavigationContext()

  const { params } = getTokensFromPath()
  const { searchTerm, setQuery, clearSearchCache } = useEntryContext()
  const menuItem = getSidebarPath()

  const [value, setValue] = useState({ textValue: searchTerm })
  const [startedTyping, setStartedTyping] = useState(false)

  // wait until user stopped typing for 200ms before setting the value
  const debounced = useCallback(
    debounce(val => {
      setQuery(val)
      // only run when the user typed the first letter in search input
      if (val.textValue && !value.textValue) {
        setStartedTyping(true)
      }
    }, 200),
    [setQuery]
  )
  useEffect(
    () => {
      debounced(value)
    },
    [value]
  )

  useEffect(
    () => {
      if (startedTyping) {
        navigateSidebar('/search')
      }
    },
    [startedTyping]
  )

  const clear = () => {
    clearSearchCache()
    setQuery({ textValue: '' })
    setValue({ textValue: '' })
  }

  const encodedSearchTerm = encodeURI(searchTerm.replace(/\?/g, ''))

  const onSearchClick = () => {
    // encode the search term and remove '?'
    navigate(`/search/${encodedSearchTerm}`)
    navigateSidebar('/search')
  }

  return (
    <>
      <SearchInputContainer
        placeholder="Search"
        textColor={menuItem === 'search' ? 'text.2' : 'text.3'}
        value={value}
        onChange={setValue}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            onSearchClick()
          }
        }}
        onClear={clear}
        onClick={onClick}
        autoFocus={menuItem === 'search'}
      />
      {searchTerm &&
        menuItem === 'search' && (
          <View height={sidebarListHeight} overflow="scroll">
            <SidebarListItem
              onPress={onSearchClick}
              isActive={encodedSearchTerm === params}
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
            <Authors
              filterQuery={{ textValue: searchTerm }}
              LoadingFallback={false}
            />
            <SourceTitles
              filterQuery={{ textValue: searchTerm }}
              LoadingFallback={false}
            />
            <Topics
              filterQuery={{ textValue: searchTerm }}
              LoadingFallback={false}
            />
          </View>
        )}
    </>
  )
}

export default Search
