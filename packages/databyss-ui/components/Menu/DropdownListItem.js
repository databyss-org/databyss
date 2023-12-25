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
  iconSize,
  iconColor,
  textColor,
  label,
  labelHtml,
  subLabel,
  shortcut,
  onPress,
  onKeyDown,
  switchControl,
  value,
  activeNavigationItem,
  navigationItemRef,
  navigationItemHandle,
  light,
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
        <View flexDirection="row" alignItems="flex-start" flexShrink={1}>
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
            <Icon
              sizeVariant={iconSize ?? 'small'}
              mr="small"
              color={light ? 'text.3' : iconColor}
            >
              {icon}
            </Icon>
          )}
          <View pt={pxUnits(1)}>
            {labelHtml ? (
              <RawHtml html={labelHtml} />
            ) : (
              <Text variant="uiTextSmall" color={light ? 'text.3' : textColor}>
                {label}
              </Text>
            )}
            {subLabel && (
              <Text variant="uiTextTiny" color="text.3">
                {subLabel}
              </Text>
            )}
          </View>
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
  textColor: 'text.0',
  iconColor: 'text.2',
}

export default withKeyboardNavigation(DropdownListItem)
