import React from 'react'
import { View, Text, Icon, BaseControl } from '@databyss-org/ui/primitives'
import { pxUnits } from '@databyss-org/ui/theming/views'

const DropdownListItem = ({
  action,
  textSymbol,
  icon,
  label,
  shortcut,
  onPress,
  onKeyDown,
}) => (
  <BaseControl
    data-test-block-menu={action}
    onPress={onPress}
    onKeyDown={onKeyDown}
    childViewProps={{ width: '100%' }}
    px="small"
    py="extraSmall"
    hoverColor="background.1"
    activeColor="background.1"
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
          <Icon sizeVariant="small" mr="small" color="text.2">
            {icon}
          </Icon>
        )}
        <Text variant="uiTextSmall">{label}</Text>
      </View>
      {shortcut && (
        <Text variant="uiTextSmall" color="text.3">
          {shortcut}
        </Text>
      )}
    </View>
  </BaseControl>
)

export default DropdownListItem
