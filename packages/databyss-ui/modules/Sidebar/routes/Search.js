import React from 'react'
import {
  EntrySearchLoader,
  // AuthorsLoader,
  // SourceCitationsLoader,
  // PagesLoader,
  // AllTopicsLoader,
} from '@databyss-org/ui/components/Loaders'
import { useEntryContext } from '@databyss-org/services/entries/EntryProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import {
  Text,
  View,
  BaseControl,
  Grid,
  Separator,
} from '@databyss-org/ui/primitives'
import SearchInputContainer from '@databyss-org/ui/components/SearchContent/SearchInputContainer'
import Pages from '@databyss-org/ui/modules/Sidebar/routes/Pages'
import Sources from '@databyss-org/ui/modules/Sidebar/routes/Sources'
import Topics from '@databyss-org/ui/modules/Sidebar/routes/Topics'
import { sidebarListHeight } from '@databyss-org/ui/modules/Sidebar/Sidebar'

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
            <EntrySearchLoader query={searchTerm}>
              {results => (
                <BaseControl onClick={onSearchClick}>
                  <Separator color="border.1" />
                  <View justifyContent="center" p="small" position="relative">
                    <Grid singleRow alignItems="center" p="small">
                      <View>
                        <Grid columnGap="none">
                          <Text variant="uiTextTiny" color="text.2">
                            A
                          </Text>
                          <Text variant="uiTextTinyItalic" color="text.2">
                            a
                          </Text>
                        </Grid>
                      </View>

                      <Text variant="uiTextSmall" color="text.2">
                        {results.count}{' '}
                        {results.count !== 1 ? 'entries' : 'entry'}
                      </Text>
                      <View position="absolute" right="0px">
                        <Text variant="uiTextTiny" color="text.2">
                          ENTER
                        </Text>
                      </View>
                    </Grid>
                  </View>
                  <Separator color="border.1" />
                </BaseControl>
              )}
            </EntrySearchLoader>
            <Pages filterQuery={{ textValue: searchTerm }} />
            <Sources filterQuery={{ textValue: searchTerm }} />
            <Topics filterQuery={{ textValue: searchTerm }} />
          </View>
        )}
    </SearchInputContainer>
  )
}

export default Search
