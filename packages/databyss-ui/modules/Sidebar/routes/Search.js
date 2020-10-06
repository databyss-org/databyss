import React, { useEffect, useCallback, useState, useRef } from 'react'
import { useEntryContext } from '@databyss-org/services/entries/EntryProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { Text, View } from '@databyss-org/ui/primitives'
import SearchInputContainer from '@databyss-org/ui/components/SearchContent/SearchInputContainer'
import { debounce } from 'lodash'
import { sidebarListHeight } from '@databyss-org/ui/modules/Sidebar/Sidebar'
import SidebarListItem from '@databyss-org/ui/components/Sidebar/SidebarListItem'
import { iconSizeVariants } from '@databyss-org/ui/theming/icons'
import SidebarSearchResults from '../../../components/Sidebar/SidebarSearchResults'

const Search = () => {
  const {
    navigate,
    navigateSidebar,
    getSidebarPath,
    getTokensFromPath,
  } = useNavigationContext()

  const { params } = getTokensFromPath()
  const {
    searchTerm,
    setQuery,
    clearSearchCache,
    searchCache,
  } = useEntryContext()
  const menuItem = getSidebarPath()

  const [value, setValue] = useState({ textValue: searchTerm })

  const setSearchValue = val => {
    setValue(val)
    // if searchbar is cleared and the cache has results, clear results
    if (!val.textValue.length && Object.keys(searchCache).length) {
      clearSearchCache()
    }
  }

  // wait until user stopped typing for 200ms before setting the value
  const debounced = useCallback(
    debounce(val => {
      // only allow alphanumeric, hyphen and space
      setQuery({
        textValue: val.textValue.replace(/[^a-zA-Z0-9À-ž-'" ]/gi, ''),
      })
    }, 200),
    [setQuery]
  )
  useEffect(
    () => {
      debounced(value)
    },
    [value]
  )

  const clear = () => {
    clearSearchCache()
    setQuery({ textValue: '' })
    setValue({ textValue: '' })
  }

  // encode the search term and remove '?'
  const encodedSearchTerm = useRef(encodeURI(searchTerm.replace(/\?/g, '')))

  useEffect(
    () => {
      encodedSearchTerm.current = encodeURIComponent(value.textValue)
    },
    [searchTerm, value]
  )

  const onSearchClick = () => {
    // clear cache to get updated results
    clearSearchCache()
    // if not currently in search page, navigate to search page
    if (encodedSearchTerm.current && params !== encodedSearchTerm.current) {
      navigate(`/search/${encodedSearchTerm.current}`)
    }
    navigateSidebar('/search')
  }

  const onInputFocus = () => {
    if (getSidebarPath() !== 'search') {
      navigateSidebar('/search')
    }
  }

  return (
    <>
      <SearchInputContainer
        placeholder="Search"
        value={value}
        onChange={setSearchValue}
        onFocus={onInputFocus}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            onSearchClick()
          }
        }}
        onClear={clear}
        onClick={() => navigateSidebar('/search')}
        autoFocus={menuItem === 'search'}
        textColor={menuItem === 'search' ? 'text.2' : 'text.3'}
      />
      {searchTerm &&
        menuItem === 'search' && (
          <View height={sidebarListHeight} overflowY="auto">
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
            <SidebarSearchResults filterQuery={{ textValue: searchTerm }} />
          </View>
        )}
    </>
  )
}

export default Search
