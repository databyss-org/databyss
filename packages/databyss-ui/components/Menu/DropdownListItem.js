import React, { useImperativeHandle } from 'react'
import {
  View,
  Text,
  Icon,
  BaseControl,
  Switch,
  RawHtml,
} from '@databyss-org/ui/primitives'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { withKeyboardNavigation } from '../../primitives/List/KeyboardNavigationItem'

const DropdownListItem = ({
  action,
  textSymbol,
  icon,
  iconColor,
  label,
  labelHtml,
  shortcut,
  onPress,
  onKeyDown,
  switchControl,
  value,
  activeNavigationItem,
  navigationItemRef,
  navigationItemHandle,
  ...others
}) => {
  useImperativeHandle(navigationItemHandle, () => ({
    selectNavigationItem: onPress,
  }))

  return (
    <BaseControl
      data-test-block-menu={action}
      onPress={onPress}
      onKeyDown={onKeyDown}
      childViewProps={{ width: '100%' }}
      px="small"
      py="extraSmall"
      hoverColor="background.1"
      activeColor="background.1"
      active={activeNavigationItem}
      ref={navigationItemRef}
      {...others}
    >
      <View
        flexDirection="row"
        justifyContent="space-between"
        width="100%"
        alignItems="center"
      >
        <View flexDirection="row" alignItems="center" flexShrink={1}>
          {textSymbol && (
            <Text
              variant="uiTextSmall"
              width={pxUnits(20)}
              textAlign="center"
              mr="small"
              color="text.2"
            >
              {textSymbol}
            </Text>
          )}
          {icon && (
            <Icon sizeVariant="small" mr="small" color={iconColor}>
              {icon}
            </Icon>
          )}
          {labelHtml ? (
            <RawHtml html={labelHtml} />
          ) : (
            <Text variant="uiTextSmall">{label}</Text>
          )}
        </View>
        {switchControl && <Switch value={value} />}
        {shortcut && (
          <Text variant="uiTextSmall" color="text.3">
            {shortcut}
          </Text>
        )}
      </View>
    </BaseControl>
  )
}

DropdownListItem.defaultProps = {
  iconColor: 'text.2',
}

export default withKeyboardNavigation(DropdownListItem)
