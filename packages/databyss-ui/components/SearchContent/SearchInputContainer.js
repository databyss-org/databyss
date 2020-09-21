import React from 'react'
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
import { pxUnits } from '@databyss-org/ui/theming/views'

const SearchInputContainer = ({
  placeholder,
  onChange,
  onKeyDown,
  onFocus,
  onClear,
  children,
  onClick,
  autoFocus,
  value,
  textColor,
}) => (
  <View width="100%" px="small" mt="small" mb={pxUnits(12)} onClick={onClick}>
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
          data-test-element="search-input"
          placeholder={placeholder}
          autoFocus={autoFocus}
          variant="bodyNormal"
          color={textColor}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
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

SearchInputContainer.defaultProps = {
  textColor: 'text.2',
}

export default SearchInputContainer
