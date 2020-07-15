import React, { useEffect, useRef } from 'react'
import { unescape } from 'lodash'
import { EntrySearchLoader } from '@databyss-org/ui/components/Loaders'
import { useEntryContext } from '@databyss-org/services/entries/EntryProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import {
  Text,
  View,
  TextInput,
  BaseControl,
  Grid,
  Icon,
  Separator,
} from '@databyss-org/ui/primitives'
import SearchIcon from '@databyss-org/ui/assets/search.svg'
import CloseSvg from '@databyss-org/ui/assets/close.svg'
import { theme } from '@databyss-org/ui/theming'
import styledCss from '@styled-system/css'

function unescapeHTML(string) {
  var elt = document.createElement('span')
  elt.innerHTML = string
  return elt.innerText
}

HTMLInputElement.prototype.insertAtCaret = function(text) {
  text = text || ''
  if (document.selection) {
    // IE
    this.focus()
    var sel = document.selection.createRange()
    sel.text = text
  } else if (this.selectionStart || this.selectionStart === 0) {
    // Others
    var startPos = this.selectionStart
    var endPos = this.selectionEnd
    this.value =
      this.value.substring(0, startPos) +
      text +
      this.value.substring(endPos, this.value.length)
    this.selectionStart = startPos + text.length
    this.selectionEnd = startPos + text.length
  } else {
    this.value += text
  }
}

const Search = ({ onClick }) => {
  const { navigate, getSidebarPath } = useNavigationContext()
  const { searchTerm, setQuery, clearSearchCache } = useEntryContext()
  const menuItem = getSidebarPath()

  const clear = () => {
    clearSearchCache()
    setQuery({ textValue: '' })
  }

  // reset search on unmount
  useEffect(() => () => clear(), [])

  useEffect(
    () => {
      if (menuItem !== 'search') {
        setQuery({ textValue: '' })
      }
    },
    [menuItem]
  )

  const onChange = val => {
    // if (!inDeadKey.current) {
    // whitelist alphanumeric, space and hyphen
    // const _val = {
    //   textValue: val.textValue.replace(/[^a-z0-9À-ú -]/gi, ''),
    // }

    // console.log(_val)
    setQuery(val)
    //   }
  }

  console.log(searchTerm)

  const onSearchClick = () => {
    navigate(`/search/${searchTerm}`)
  }

  const inDeadKey = useRef(false)
  const diacritic = useRef()

  const diacriticMap = keyCode => ({ 69: '769', 85: '¨' }[keyCode])

  return (
    <View width="100%" px="small" my="small" onClick={onClick}>
      <p> a&#771;</p>
      <View
        backgroundColor="background.0"
        height="100%"
        justifyContent="center"
        position="relative"
        flex={1}
        borderVariant="thinLight"
        px="small"
        py="extraSmall"
      >
        <Grid singleRow alignItems="center" columnGap="none" flexWrap="nowrap">
          <Icon sizeVariant="medium" color="text.3" pr="small">
            <SearchIcon />
          </Icon>
          <TextInput
            placeholder="Search"
            variant="bodyNormal"
            color="text.2"
            value={{ textValue: searchTerm }}
            onChange={onChange}
            onKeyUp={e => {
              //   if (inDeadKey.current && e.keyCode !== 18) {
              //     diacritic.current = diacriticMap(e.keyCode)
              //   }
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                onSearchClick()
              }

              //   if (inDeadKey.current) {
              //     e.preventDefault()
              //     e.target.insertAtCaret(
              //       unescapeHTML(`${e.key}&#${diacritic.current};`)
              //     )
              //   }

              //   if (e.key === 'Dead') {
              //     inDeadKey.current = true
              //   } else {
              //     inDeadKey.current = false
              //   }
            }}
            concatCss={styledCss({
              '::placeholder': {
                color: 'text.3',
                opacity: 0.6,
              },
            })(theme)}
          />
          {searchTerm && (
            <View position="absolute" right="small">
              <BaseControl onClick={clear}>
                <Icon sizeVariant="tiny" color="text.3">
                  <CloseSvg />
                </Icon>
              </BaseControl>
            </View>
          )}
        </Grid>
      </View>
      {searchTerm &&
        menuItem === 'search' && (
          <View height="40px" pt="medium" pb="medium">
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
          </View>
        )}
    </View>
  )
}

export default Search
