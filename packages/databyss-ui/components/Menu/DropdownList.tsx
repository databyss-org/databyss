import React from 'react'
import DropdownListItem from './DropdownListItem'
import { Separator } from '../..'
import { DListItemProps } from '../DynamicList/DList'
import { ContextMenu } from './ContextMenu'

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
  subMenu?: MenuItem[]
  subMenuProps?: Partial<DListItemProps>
  hoverColor?: string
  activeColor?: string
}

export interface DropdownListOptions {
  menuItems: MenuItem[]
  dismiss?: () => void
  data?: any
}

export const DropdownList = ({
  menuItems,
  dismiss,
  data,
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
            if (menuItem.action && (await menuItem.action(data)) && dismiss) {
              dismiss()
            }
          }}
          key={menuItem.label}
        >
          {menuItem.subMenu ? (
            <ContextMenu
              menuItems={menuItem.subMenu}
              data={idx}
              {...menuItem.subMenuProps}
            />
          ) : null}
        </DropdownListItem>
      )

      return _item
    })}
  </>
)
