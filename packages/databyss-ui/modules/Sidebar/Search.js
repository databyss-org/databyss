import React, { useEffect, useCallback, useState, useRef } from 'react'
import { debounce } from 'lodash'
import { useSearchContext } from '@databyss-org/ui/hooks'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { View } from '@databyss-org/ui/primitives'
import SearchInputContainer from '../../components/Sidebar/SearchInputContainer'

import SidebarSearchResults from './SidebarSearchResults'

const Search = (others) => {
  const {
    navigate,
    navigateSidebar,
    getSidebarPath,
    getTokensFromPath,
  } = useNavigationContext()

  const { params, type: paramsType } = getTokensFromPath()
  const searchTerm = useSearchContext((c) => c && c.searchTerm)
  const setQuery = useSearchContext((c) => c && c.setQuery)
  const menuItem = getSidebarPath()

  const [value, setValue] = useState(searchTerm)
  const [hasFocus, setHasFocus] = useState(false)

  const inputRef = useRef()

  // wait until user stopped typing for 200ms before setting the value
  const debounced = useCallback(
    debounce((val) => {
      // only allow alphanumeric, hyphen and space
      setQuery(val.replace(/[^a-zA-Z0-9À-ž-'" ]/gi, ''))
    }, 200),
    [setQuery]
  )

  useEffect(() => {
    debounced(value)
  }, [value])

  const clear = () => {
    setQuery('')
    setValue('')
    inputRef.current.focus()
  }

  // encode the search term and remove '?'
  const encodedSearchTerm = useRef(encodeURI(searchTerm.replace(/\?/g, '')))

  useEffect(() => {
    encodedSearchTerm.current = encodeURIComponent(value)
  }, [searchTerm, value])

  useEffect(() => {
    if (paramsType === 'search') {
      setQuery(params)
      setValue(params)
    }
  }, [params])

  const onSearchClick = () => {
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
    setHasFocus(true)
  }

  const onInputBlur = () => {
    setHasFocus(false)
  }

  return (
    <>
      <SearchInputContainer
        placeholder="Search"
        value={value}
        onChange={(value) => setValue(value.textValue)}
        onFocus={onInputFocus}
        onBlur={onInputBlur}
        onClear={clear}
        onClick={() => navigateSidebar('/search')}
        autoFocus={menuItem === 'search'}
        textColor={menuItem === 'search' ? 'text.2' : 'text.3'}
        ref={inputRef}
        {...others}
      />
      {searchTerm && menuItem === 'search' ? (
        <SidebarSearchResults
          filterQuery={searchTerm}
          onSearch={onSearchClick}
          height="100%"
          inputRef={inputRef}
          searchHasFocus={hasFocus}
          {...others}
        />
      ) : (
        menuItem === 'search' && (
          <View height="100%" flexShrink={1} flexGrow={1} />
        )
      )}
    </>
  )
}

export default Search
