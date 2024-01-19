import React, { ReactNode, useRef, useState } from 'react'
import {
  useFloating,
  FloatingPortal,
  useClientPoint,
  useInteractions,
  offset,
  shift,
  flip,
} from '@floating-ui/react'
import { DropdownList, MenuItem } from '../Menu/DropdownList'
import {
  BaseControl,
  DropdownContainer,
  Icon,
  ListProps,
  ViewProps,
  View,
} from '../..'
import ClickAwayListener from '../Util/ClickAwayListener'
import MenuSvg from '../../assets/menu_horizontal.svg'
import { pxUnits } from '../../theming/views'

export interface ContextMenuProps extends ListProps {
  menuItems: MenuItem[]
  menuIcon?: ReactNode
  menuViewProps?: ViewProps
  dropdownContainerProps?: any
  data: any
  onActiveChanged?: (isActive: boolean) => void
}

export const ContextMenu = ({
  menuItems,
  menuIcon = (
    <Icon sizeVariant="tiny">
      <MenuSvg />
    </Icon>
  ),
  menuViewProps,
  dropdownContainerProps,
  data,
  onActiveChanged,
}: ContextMenuProps) => {
  const { refs, floatingStyles, context } = useFloating({
    placement: 'right-start',
    middleware: [
      offset({
        mainAxis: 10,
        crossAxis: 10,
      }),
      shift(),
      flip({
        crossAxis: false,
      }),
    ],
  })
  const menuPosX = useRef(0)
  const [menuVisible, setMenuVisible] = useState(false)
  const [hoverVisible, setHoverVisible] = useState(false)
  const hoverTimerRef = useRef<any>(0)

  const clientPoint = useClientPoint(context, {
    axis: 'x',
    x: menuPosX.current,
  })

  const { getReferenceProps, getFloatingProps } = useInteractions([clientPoint])

  const _activatorView = (
    <View
      onMouseOver={() => {
        clearTimeout(hoverTimerRef.current)
        setHoverVisible(true)
      }}
      onMouseOut={() => {
        if (!menuVisible) {
          hoverTimerRef.current = setTimeout(() => {
            setHoverVisible(false)
          }, 50)
        }
      }}
      // onMouseDown={(evt) => {
      //   if (evt.button === )
      // }}
      onContextMenu={(evt) => {
        menuPosX.current = (evt as any).clientX
        setMenuVisible(true)
        if (onActiveChanged) {
          onActiveChanged(true)
        }
      }}
      position="absolute"
      left="0"
      top="0"
      bottom="0"
      right="0"
      // bg={menuVisible ? 'pink' : 'transparent'}
    />
  )
  const _menuButtonView = (
    <View
      onMouseOver={() => {
        clearTimeout(hoverTimerRef.current)
      }}
      onMouseOut={() => {
        if (!menuVisible) {
          hoverTimerRef.current = setTimeout(() => {
            setHoverVisible(false)
          }, 50)
        }
      }}
      ref={refs.setReference}
      {...getReferenceProps()}
      {...menuViewProps}
    >
      {hoverVisible ? (
        <BaseControl
          renderAsView
          onPress={(evt) => {
            evt.stopPropagation()
            // evt.preventDefault()
            menuPosX.current = (evt as any).clientX
            setMenuVisible(true)
            if (onActiveChanged) {
              onActiveChanged(true)
            }
          }}
        >
          {menuIcon}
        </BaseControl>
      ) : null}
    </View>
  )

  const _menuView = (
    <FloatingPortal>
      <ClickAwayListener
        onClickAway={() => {
          setHoverVisible(false)
          setMenuVisible(false)
          if (onActiveChanged) {
            onActiveChanged(false)
          }
        }}
      >
        <DropdownContainer
          widthVariant="dropdownMenuMedium"
          open
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
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
    </FloatingPortal>
  )

  return (
    <>
      {_activatorView}
      {_menuButtonView}
      {menuVisible ? _menuView : null}
    </>
  )
}

ContextMenu.defaultProps = {
  menuViewProps: {
    right: 'small',
  },
  dropdownContainerProps: {
    position: {
      top: pxUnits(20),
    },
  },
}

// export const ContextMenu = ({
//   children,
//   menuItems,
//   menuIcon = (
//     <Icon sizeVariant="tiny">
//       <MenuSvg />
//     </Icon>
//   ),
//   menuViewProps,
//   dropdownContainerProps,
//   ...others
// }: DListProps) => {
//   const _children = React.Children.map(children, (child, idx) => (
//     <DListItem
//       menuItems={menuItems}
//       menuIcon={menuIcon}
//       menuViewProps={menuViewProps}
//       dropdownContainerProps={dropdownContainerProps}
//       data={idx}
//       key={idx}
//     >
//       {child}
//     </DListItem>
//   ))
//   return <List {...others}>{_children}</List>
// }
