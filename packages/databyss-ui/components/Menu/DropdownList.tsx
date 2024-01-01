import React from 'react'
import DropdownListItem from './DropdownListItem'
import { Separator } from '../..'
import { DListItem, DListItemProps } from '../DynamicList/DList'

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
}

export interface DropdownListOptions {
  menuItems: MenuItem[]
  dismiss?: () => void
  data?: any
}

export const makeDropdownListChildren = ({
  menuItems,
  dismiss,
  data,
}: DropdownListOptions ) => menuItems.map(({ separator, ...menuItem }, idx) => {
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
    />
  )

  if (menuItem.subMenu) {
    return (
      <DListItem 
        menuItems={menuItem.subMenu} 
        data={idx} 
        key={idx} 
        {...menuItem.subMenuProps}
      >
        {_item}
      </DListItem>
    )
  }

  return _item
})

export const DropdownList = (options: DropdownListOptions) => (
  <>
    {makeDropdownListChildren(options)}
  </>
)
