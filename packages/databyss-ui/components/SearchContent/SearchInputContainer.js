import React, { useEffect, useCallback, useState } from 'react'
import {
  View,
  TextInput,
  BaseControl,
  Grid,
  Icon,
} from '@databyss-org/ui/primitives'
import SearchIcon from '@databyss-org/ui/assets/search.svg'
import CloseSvg from '@databyss-org/ui/assets/close.svg'
import { theme } from '@databyss-org/ui/theming'
import styledCss from '@styled-system/css'
import { debounce } from 'lodash'

const SearchInputContainer = ({
  placeholder,
  onChange,
  onKeyDown,
  onClear,
  children,
}) => {
  const [value, setValue] = useState({ textValue: '' })

  // wait until user stopped typing for 100ms before setting the value
  const debounced = useCallback(debounce(val => onChange(val), 100), [onChange])
  useEffect(() => debounced(value), [value])

  return (
    <View width="100%" px="small" my="small">
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
            placeholder={placeholder}
            variant="bodyNormal"
            color="text.2"
            value={value}
            onChange={setValue}
            onKeyDown={onKeyDown}
            concatCss={styledCss({
              '::placeholder': {
                color: 'text.3',
                opacity: 0.6,
              },
            })(theme)}
          />
          {value.textValue && (
            <View position="absolute" right="small">
              <BaseControl onClick={onClear}>
                <Icon sizeVariant="tiny" color="text.3">
                  <CloseSvg />
                </Icon>
              </BaseControl>
            </View>
          )}
        </Grid>
      </View>
      {children}
    </View>
  )
}

export default SearchInputContainer
