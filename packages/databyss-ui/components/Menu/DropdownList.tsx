import React from 'react'
import DropdownListItem from './DropdownListItem'
import { Separator } from '../..'
import { ContextMenu, ContextMenuProps } from './ContextMenu'

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
}

export const DropdownList = ({
  menuItems,
  dismiss,
  data,
  onChange,
}: DropdownListOptions) => (
  <>
    {menuItems.map(({ separator, ...menuItem }, idx) => {
      if (separator) {
        return <Separator {...menuItem} key={idx} lineWidth={idx > 0 ? 1 : 0} />
      }

      const _item = (
        <DropdownListItem
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
          {menuItem.subMenu ? (
            <ContextMenu {...menuItem.subMenuProps!} />
          ) : null}
        </DropdownListItem>
      )

      return _item
    })}
  </>
)
