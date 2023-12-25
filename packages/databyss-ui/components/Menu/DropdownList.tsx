import React from 'react'
import DropdownListItem from './DropdownListItem'
import { Separator } from '../..'

export interface MenuItem {
  label: string
  icon?: React.ReactElement
  iconSize?: string
  iconColor?: string
  action?: (data: any) => boolean | void | Promise<boolean>
  actionType?: string
  disabled?: boolean
  separator?: boolean
}

export const DropdownList = ({
  menuItems,
  dismiss,
  data,
}: {
  menuItems: MenuItem[]
  dismiss?: () => void
  data?: any
}) => (
  <>
    {menuItems.map(({ separator, ...menuItem }, idx) =>
      separator ? (
        <Separator {...menuItem} key={idx} lineWidth={idx > 0 ? 1 : 0} />
      ) : (
        <DropdownListItem
          {...menuItem}
          action={menuItem.actionType}
          onPress={async () => {
            if (menuItem.action && (await menuItem.action(data)) && dismiss) {
              dismiss()
            }
          }}
          key={menuItem.label}
        />
      )
    )}
  </>
)
