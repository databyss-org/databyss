import React, { useState } from 'react'
import DropdownListItem from './DropdownListItem'
import { Separator } from '../..'
import { DListItem, DListItemProps } from '../DynamicList/DList'
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
}: DropdownListOptions) => {
  const [activeIdx, setActiveIdx] = useState(-1)

  return (
    <>
      {menuItems.map(({ separator, ...menuItem }, idx) => {
        if (separator) {
          return (
            <Separator {...menuItem} key={idx} lineWidth={idx > 0 ? 1 : 0} />
          )
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
            isActive={activeIdx === idx}
            key={menuItem.label}
          >
            {menuItem.subMenu ? (
              <ContextMenu
                menuItems={menuItem.subMenu}
                data={idx}
                onActiveChanged={(isActive) => {
                  if (!isActive && activeIdx === idx) {
                    setActiveIdx(-1)
                  }
                  if (isActive) {
                    setActiveIdx(idx)
                  }
                }}
                {...menuItem.subMenuProps}
              />
            ) : null}
          </DropdownListItem>
        )

        return _item
      })}
    </>
  )
}
