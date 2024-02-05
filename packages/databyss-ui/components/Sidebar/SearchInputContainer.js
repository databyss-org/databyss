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

const SearchInputContainer = React.forwardRef(
  (
    {
      placeholder,
      onChange,
      onKeyDown,
      onFocus,
      onBlur,
      onClear,
      children,
      onClick,
      autoFocus,
      value,
      textColor,
      ...others
    },
    ref
  ) => (
    <View width="100%" {...others} onClick={onClick} px="small">
      <View
        backgroundColor="gray.1"
        height="100%"
        justifyContent="center"
        position="relative"
        flex={1}
        px="small"
        py="extraSmall"
        borderRadius="none"
      >
        <Grid singleRow alignItems="center" columnGap="none" flexWrap="nowrap">
          <Icon sizeVariant="medium" color="text.3" pr="small">
            <SearchIcon />
          </Icon>
          <TextInput
            data-test-element="search-input"
            placeholder={placeholder}
            autoFocus={autoFocus}
            variant="uiTextNormal"
            color={textColor}
            value={{ textValue: value }}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            ref={ref}
            // width="100%"
            concatCss={styledCss({
              '::placeholder': {
                color: 'text.3',
                opacity: 0.6,
              },
              flexGrow: 1,
            })(theme)}
          />
          {value && (
            <View mx="small" flexShrink={1}>
              <BaseControl
                data-test-element="clear-search-results"
                onClick={onClear}
              >
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
)

SearchInputContainer.defaultProps = {
  textColor: 'text.2',
}

export default SearchInputContainer
