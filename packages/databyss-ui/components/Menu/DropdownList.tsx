import React, { useCallback, useState } from 'react'
import CloseSvg from '@databyss-org/ui/assets/close.svg'
import { Text } from '@databyss-org/services/interfaces'
import styledCss from '@styled-system/css'
import { theme } from '@databyss-org/ui/theming'
import DropdownListItem from './DropdownListItem'
import { Separator, View, Icon, TextInput, BaseControl } from '../..'
import { ContextMenu, ContextMenuProps } from './ContextMenu'
import { Hotkey } from '../Util/Hotkey'

export interface MenuItem {
  label: string
  icon?: React.ReactElement
  iconSize?: string
  iconColor?: string
  action?: (data: any) => boolean | void | Promise<boolean>
  actionType?: string
  disabled?: boolean
  separator?: boolean
  subLabel?: string
  subMenu?: boolean
  subMenuProps?: ContextMenuProps
  hoverColor?: string
  activeColor?: string
  value?: any
}

export interface DropdownListOptions {
  menuItems: MenuItem[]
  dismiss?: () => void
  data?: any
  onChange?: (value: any) => void
  onQueryChange?: (value: string) => void
  showFilterQuery?: boolean
  nowrap?: boolean
}

export const DropdownList = ({
  menuItems,
  dismiss,
  data,
  onChange,
  showFilterQuery,
  nowrap,
  onQueryChange,
}: DropdownListOptions) => {
  const [query, setQuery] = useState<string>('')

  const setQueryValue = useCallback(
    (value: string) => {
      setQuery(value)
      requestAnimationFrame(() => {
        if (onQueryChange) {
          onQueryChange(value)
        }
      })
    },
    [setQuery, onQueryChange]
  )

  const _filterView = (
    <View
      flexDirection="row"
      alignItems="center"
      py="tiny"
      px="extraSmall"
      my="tiny"
      mx="extraSmall"
      borderVariant="thinLight"
    >
      <TextInput
        autoFocus
        placeholder="Search"
        variant="uiTextSmall"
        color="text.2"
        value={{ textValue: query }}
        onChange={(value: Text) => setQueryValue(value.textValue)}
        // onKeyDown={onKeyDown}
        // onFocus={onFocus}
        // onBlur={onBlur}
        // ref={ref}
        // width="100%"
        concatCss={styledCss({
          '::placeholder': {
            color: 'text.3',
            opacity: 0.6,
          },
          flexGrow: 1,
        })(theme)}
      />
      {query.length ? (
        <View flexShrink={1}>
          <BaseControl onClick={() => setQueryValue('')}>
            <Icon sizeVariant="tiny" color="text.3">
              <CloseSvg />
            </Icon>
          </BaseControl>
        </View>
      ) : null}
      <Hotkey
        keyName="Escape"
        onPress={() => {
          setQueryValue('')
        }}
      />
    </View>
  )

  let _menuItems = menuItems
  if (query.length) {
    _menuItems = menuItems.filter((_item) =>
      query.split(' ').reduce(
        (_prev, _curr) =>
          _prev &&
          !!_item.label
            .split(' ')
            .find((_str) => _str.toLowerCase().startsWith(_curr.toLowerCase())),

        true
      )
    )
  }

  const _itemsView = _menuItems.map(({ separator, ...menuItem }, idx) => {
    if (separator) {
      return <Separator {...menuItem} key={idx} lineWidth={idx > 0 ? 1 : 0} />
    }

    const _item = (
      <DropdownListItem
        nowrap={nowrap}
        {...menuItem}
        action={menuItem.actionType}
        onPress={async () => {
          const _success = !menuItem.action || (await menuItem.action(data))
          if (!_success) {
            return
          }
          if (onChange) {
            onChange(menuItem.value)
          }
          if (dismiss) {
            dismiss()
          }
        }}
        key={menuItem.label}
      >
        {menuItem.subMenu ? <ContextMenu {...menuItem.subMenuProps!} /> : null}
      </DropdownListItem>
    )

    return _item
  })
  return (
    <>
      {showFilterQuery && _filterView}
      <View key={`ddl_${query}`}>{_itemsView}</View>
    </>
  )
}
