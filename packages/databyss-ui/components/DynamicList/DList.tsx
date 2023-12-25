import React, { ReactElement, ReactNode, useRef, useState } from 'react'
import { DropdownList, MenuItem } from '../Menu/DropdownList'
import {
  BaseControl,
  DropdownContainer,
  List,
  Icon,
  ListProps,
  ViewProps,
  View,
} from '../..'
import ClickAwayListener from '../Util/ClickAwayListener'
import MenuSvg from '../../assets/menu_horizontal.svg'

export interface DListProps extends ListProps {
  menuItems?: MenuItem[]
  menuIcon?: ReactNode
  menuViewProps?: ViewProps
  dropdownContainerProps?: any
}

export const DList = ({
  children,
  menuItems,
  menuIcon = <MenuSvg />,
  menuViewProps,
  dropdownContainerProps,
  ...others
}: DListProps) => {
  const [menuIndex, setMenuIndex] = useState(-1)
  const [hoverIndex, setHoverIndex] = useState(-1)
  const hoverTimerRef = useRef<any>(0)
  const _children = React.Children.map(children, (child, idx) => (
    <View
      onMouseOver={() => {
        clearTimeout(hoverTimerRef.current)
        setHoverIndex(idx)
      }}
      onMouseOut={() => {
        hoverTimerRef.current = setTimeout(() => {
          setHoverIndex(-1)
          setMenuIndex(-1)
        }, 1000)
      }}
      position="relative"
      key={(child as ReactElement)?.key ?? idx}
      justifyContent="center"
    >
      {menuItems && hoverIndex === idx && (
        <View position="absolute" {...menuViewProps}>
          <BaseControl onPress={() => setMenuIndex(idx)}>
            <Icon sizeVariant="tiny">{menuIcon}</Icon>
          </BaseControl>
          {menuIndex === idx && (
            <ClickAwayListener onClickAway={() => setMenuIndex(-1)}>
              <DropdownContainer
                widthVariant="dropdownMenuMedium"
                open
                {...dropdownContainerProps}
              >
                <DropdownList
                  data={idx}
                  menuItems={menuItems}
                  dismiss={() => {
                    setMenuIndex(-1)
                    setHoverIndex(-1)
                  }}
                />
              </DropdownContainer>
            </ClickAwayListener>
          )}
        </View>
      )}
      {child}
    </View>
  ))
  return <List {...others}>{_children}</List>
}
