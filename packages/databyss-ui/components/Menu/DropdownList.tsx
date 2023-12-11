import React from 'react'
import DropdownListItem from './DropdownListItem'
import { Separator } from '../..'

export interface MenuItem {
  label: string
  icon?: React.ReactElement
  action?: (() => boolean) | (() => Promise<boolean>)
  actionType?: string
  disabled?: boolean
  separator?: boolean
}

export const DropdownList = ({
  menuItems,
  dismiss,
}: {
  menuItems: MenuItem[]
  dismiss?: () => void
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
            if (menuItem.action && (await menuItem.action()) && dismiss) {
              dismiss()
            }
          }}
          key={menuItem.label}
        />
      )
    )}
  </>
)
