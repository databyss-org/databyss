import React, { useRef } from 'react'
import { BaseControl, Icon, View } from '../..'
import MenuSvg from '../../assets/chevron-right.svg'
import { useContextMenu } from './ContextMenuProvider'
import { theme } from '../../theming'
import Text from '../../primitives/Text/Text'
import { ContextMenuProps } from './ContextMenu'
import { pxUnits } from '../../theming/views'

export interface DropdownMenuProps extends ContextMenuProps {
  label?: string
  onChange?: (value: any) => void
  renderLabel?: (value: any) => string
  value?: any
  showFilter?: boolean
}

export const DropdownMenu = ({
  menuItems,
  menuIcon = (
    <Icon sizeVariant="tiny" css={{ transform: 'rotate(90deg)' }}>
      <MenuSvg />
    </Icon>
  ),
  menuViewProps,
  dropdownContainerProps,
  data,
  label,
  onChange,
  renderLabel,
  value,
  showFilter,
  ellipsis,
  ...other
}: DropdownMenuProps) => {
  const { showMenu, setClientPoint } = useContextMenu()
  const menuButtonRef = useRef<HTMLElement>()
  const _label = label ?? (renderLabel && renderLabel(value))
  const _menuButtonView = (
    <BaseControl
      renderAsView
      borderRadius="default"
      zIndex={theme.zIndex.menu + 1}
      onPress={(evt: any) => {
        evt.stopPropagation()
        evt.preventDefault()
        let _cx = evt.clientX
        let _cy = evt.clientY
        let _cw = 200
        if (menuButtonRef.current) {
          const _rect = menuButtonRef.current.getBoundingClientRect()
          _cx = _rect.right
          _cy = _rect.bottom
          _cw = _rect.width
        }
        setClientPoint(_cx, _cy)
        showMenu({
          data,
          menuItems,
          dropdownContainerProps: {
            ...dropdownContainerProps,
            maxWidth: pxUnits(350),
            minWidth: pxUnits(Math.max(_cw, 200)),
          },
          onChange,
          showFilter,
          ellipsis,
        })
      }}
      ref={menuButtonRef}
      {...other}
    >
      <View flexDirection="row" alignItems="center" p="tiny" {...menuViewProps}>
        {_label && (
          <Text
            variant="uiTextNormal"
            color="text.2"
            paddingRight="tiny"
            overflow="hidden"
            css={{
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {_label}
          </Text>
        )}
        {menuIcon}
      </View>
    </BaseControl>
  )

  return _menuButtonView
}

DropdownMenu.defaultProps = {
  dropdownContainerProps: {
    position: {
      top: 0,
    },
  },
  data: null,
}
