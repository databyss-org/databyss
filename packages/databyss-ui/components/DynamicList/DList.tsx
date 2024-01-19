import React, { ReactNode, useRef, useState } from 'react'
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
import { pxUnits } from '../../theming/views'
import { theme } from '../../theming'

export interface DListProps extends ListProps {
  menuItems?: MenuItem[]
  menuIcon?: ReactNode
  menuViewProps?: ViewProps
  dropdownContainerProps?: any
}

export interface DListItemProps extends DListProps {
  data: any
}

export const DListItem = ({
  menuItems,
  menuIcon = (
    <Icon sizeVariant="tiny">
      <MenuSvg />
    </Icon>
  ),
  menuViewProps,
  dropdownContainerProps,
  children,
  data,
}: DListItemProps) => {
  const [menuVisible, setMenuVisible] = useState(false)
  const [hoverVisible, setHoverVisible] = useState(true)
  const hoverTimerRef = useRef<any>(0)
  return (
    <View
      onMouseOver={() => {
        clearTimeout(hoverTimerRef.current)
        setHoverVisible(true)
      }}
      onMouseOut={() => {
        // hoverTimerRef.current = setTimeout(() => {
        //   setHoverVisible(false)
        //   setMenuVisible(false)
        // }, 200)
      }}
      position="relative"
      justifyContent="center"
    >
      {menuItems && hoverVisible && (
        <View
          position="absolute"
          zIndex={theme.zIndex.menu + 1}
          {...menuViewProps}
        >
          <BaseControl
            onPress={(evt) => {
              evt.preventDefault()
              setMenuVisible(true)
            }}
          >
            {menuIcon}
          </BaseControl>
          {menuVisible && (
            <ClickAwayListener onClickAway={() => setMenuVisible(false)}>
              <DropdownContainer
                widthVariant="dropdownMenuMedium"
                open
                {...dropdownContainerProps}
              >
                <DropdownList
                  data={data}
                  menuItems={menuItems}
                  dismiss={() => {
                    setMenuVisible(false)
                    setHoverVisible(false)
                  }}
                />
              </DropdownContainer>
            </ClickAwayListener>
          )}
        </View>
      )}
      {children}
    </View>
  )
}

DListItem.defaultProps = {
  menuViewProps: {
    right: 'small',
  },
  dropdownContainerProps: {
    position: {
      top: pxUnits(20),
    },
  },
}

export const DList = ({
  children,
  menuItems,
  menuIcon = (
    <Icon sizeVariant="tiny">
      <MenuSvg />
    </Icon>
  ),
  menuViewProps,
  dropdownContainerProps,
  ...others
}: DListProps) => {
  const _children = React.Children.map(children, (child, idx) => (
    <DListItem
      menuItems={menuItems}
      menuIcon={menuIcon}
      menuViewProps={menuViewProps}
      dropdownContainerProps={dropdownContainerProps}
      data={idx}
      key={idx}
    >
      {child}
    </DListItem>
  ))
  return <List {...others}>{_children}</List>
}
