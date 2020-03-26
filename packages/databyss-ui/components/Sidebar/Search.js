import React, { useState, useEffect } from 'react'
import {
  useEntryContext,
  EntrySearchLoader,
} from '@databyss-org/services/entries/EntryProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import {
  Text,
  View,
  TextInput,
  List,
  BaseControl,
  Grid,
  Icon,
  Separator,
} from '@databyss-org/ui/primitives'
import SearchIcon from '@databyss-org/ui/assets/search.svg'
import CloseSvg from '@databyss-org/ui/assets/close.svg'
import _ from 'lodash'

const Search = ({ onClick, menuItem }) => {
  const { path, navigate } = useNavigationContext()
  const { searchTerm } = useEntryContext()

  const [value, setValue] = useState({
    textValue: '',
  })

  useEffect(
    () => {
      if (menuItem !== 'search') {
        setValue({ textValue: '' })
      }
    },
    [menuItem]
  )

  const onChange = val => {
    setValue(val)
  }

  const onSearchClick = () => {
    navigate(`/search/${searchTerm}`)
  }

  const clear = () => {
    setValue({ textValue: '' })
  }

  return (
    <View height="40px" width="100%" m="small" onClick={onClick}>
      <View
        backgroundColor="background.1"
        height="100%"
        justifyContent="center"
        position="relative"
        flex={1}
        borderVariant="thinLight"
        p="small"
      >
        <Grid singleRow alignItems="center" columnGap="none">
          <Icon sizeVariant="small" color="text.3" pr="small">
            <SearchIcon />
          </Icon>
          <TextInput
            placeholder="Search"
            variant="bodyNormal"
            value={value}
            onChange={onChange}
          />
          <View position="absolute" right="small">
            <BaseControl onClick={clear}>
              <Icon sizeVariant="tiny" color="text.3">
                <CloseSvg />
              </Icon>
            </BaseControl>
          </View>
        </Grid>
      </View>
      {value.textValue &&
        menuItem === 'search' && (
          <View height="40px" pt="medium" pb="medium">
            <EntrySearchLoader query={value.textValue}>
              {results => {
                return (
                  <BaseControl onClick={onSearchClick}>
                    <Separator color="border.1" />
                    <View justifyContent="center" p="small">
                      <Grid singleRow alignItems="center" p="small">
                        <Text>{results.count} entries</Text>
                      </Grid>
                    </View>
                    <Separator color="border.1" />
                  </BaseControl>
                )
              }}
            </EntrySearchLoader>
          </View>
        )}
    </View>
  )
}

export default Search
