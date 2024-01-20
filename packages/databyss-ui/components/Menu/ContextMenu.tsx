import React, {
  MutableRefObject,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import { BaseControl, Icon, ListProps, ViewProps, View } from '../..'
import MenuSvg from '../../assets/menu_horizontal.svg'
import { pxUnits } from '../../theming/views'
import { useContextMenu } from './ContextMenuProvider'
import { MenuItem } from './DropdownList'

export interface ContextMenuProps extends ListProps {
  menuItems: MenuItem[]
  menuIcon?: ReactNode
  menuViewProps?: ViewProps
  dropdownContainerProps?: any
  data: any
  parentRef?: MutableRefObject<HTMLElement>
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
  parentRef,
}: ContextMenuProps) => {
  const { showMenu, setClientPoint } = useContextMenu()
  const [hoverVisible, setHoverVisible] = useState(false)
  const hoverTimerRef = useRef<any>(0)

  const _activatorView = (
    <View
      onMouseOver={() => {
        clearTimeout(hoverTimerRef.current)
        setHoverVisible(true)
      }}
      onMouseOut={() => {
        hoverTimerRef.current = setTimeout(() => {
          setHoverVisible(false)
        }, 50)
      }}
      onContextMenu={(evt) => {
        setClientPoint(evt.clientX, evt.clientY)
        showMenu({
          data,
          menuItems,
          dropdownContainerProps,
          onDismiss: () => {
            setHoverVisible(false)
          },
        })
      }}
      position="absolute"
      left="0"
      top="0"
      bottom="0"
      right="0"
    />
  )
  const _menuButtonView = (
    <View
      onMouseOver={() => {
        clearTimeout(hoverTimerRef.current)
      }}
      onMouseOut={() => {
        hoverTimerRef.current = setTimeout(() => {
          setHoverVisible(false)
        }, 50)
      }}
      // {...getReferenceProps()}
      {...menuViewProps}
    >
      {hoverVisible ? (
        <BaseControl
          renderAsView
          onPress={(evt: any) => {
            evt.stopPropagation()
            evt.preventDefault()
            setClientPoint(evt.clientX, evt.clientY)
            showMenu({
              data,
              menuItems,
              dropdownContainerProps,
              onDismiss: () => {
                hoverTimerRef.current = setTimeout(() => {
                  setHoverVisible(false)
                }, 50)
              },
            })
            if (parentRef?.current) {
              parentRef.current.focus()
            }
          }}
        >
          {menuIcon}
        </BaseControl>
      ) : null}
    </View>
  )

  return (
    <>
      {_activatorView}
      {_menuButtonView}
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
