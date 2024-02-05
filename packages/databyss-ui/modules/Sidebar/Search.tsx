import React, { useEffect, useCallback, useState, useRef } from 'react'
import { debounce } from 'lodash'
import { useSearchContext } from '@databyss-org/ui/hooks'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { View } from '@databyss-org/ui/primitives'
import SearchInputContainer from '../../components/Sidebar/SearchInputContainer'

import SidebarSearchResults from './SidebarSearchResults'
import { appCommands } from '../../lib/appCommands'

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
  const blurTimerRef = useRef<any | null>(null)
  const inputRef = useRef<HTMLElement | null>(null)

  // wait until user stopped typing for 500ms before setting the value
  const debounced = useCallback(
    debounce((val) => {
      // only allow alphanumeric, hyphen and space
      setQuery(val.replace(/[^a-zA-Z0-9À-ž-'" ]/gi, ''))
    }, 500),
    [setQuery]
  )

  useEffect(() => {
    debounced(value)
  }, [value])

  const clear = (setFocus: boolean = true) => {
    setQuery('')
    setValue('')
    if (setFocus) {
      inputRef.current?.focus()
    }
  }

  // encode the search term and remove '?'
  const encodedSearchTerm = useRef(encodeURI(searchTerm.replace(/\?/g, '')))

  useEffect(() => {
    encodedSearchTerm.current = encodeURIComponent(value)
  }, [searchTerm, value])

  useEffect(() => {
    if (paramsType === 'search') {
      setQuery(decodeURIComponent(params))
      setValue(decodeURIComponent(params))
    }
  }, [params])

  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current!.focus()
    }
  }, [inputRef.current])

  useEffect(() => {
    appCommands.addListener('find', focusInput)
    return () => {
      appCommands.removeListener('find', focusInput)
    }
  }, [appCommands, focusInput])

  const onKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        clear(false)
      }
    },
    [clear]
  )

  useEffect(() => {
    if (menuItem === 'search') {
      focusInput()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      clear()
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const onSearchClick = useCallback(() => {
    // if not currently in search page, navigate to search page
    if (encodedSearchTerm.current && params !== encodedSearchTerm.current) {
      navigate(`/search/${encodedSearchTerm.current}`)
    }
    navigateSidebar('/search')
  }, [navigate, navigateSidebar])

  const onInputFocus = useCallback(() => {
    if (getSidebarPath() !== 'search') {
      navigateSidebar('/search')
    }
    setHasFocus(true)
  }, [setHasFocus, getSidebarPath, navigateSidebar])

  const onInputBlur = useCallback(() => {
    blurTimerRef.current = setTimeout(() => setHasFocus(false), 1000)
  }, [setHasFocus, blurTimerRef])

  const onItemPressed = useCallback(() => {
    clearTimeout(blurTimerRef.current)
    setHasFocus(false)
  }, [blurTimerRef])

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
          key={searchTerm}
          borderTopWidth={1}
          borderTopColor="gray.3"
          filterQuery={searchTerm}
          onSearch={onSearchClick}
          height="100%"
          inputRef={inputRef}
          searchHasFocus={hasFocus}
          onItemPressed={onItemPressed}
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
