import React from 'react'
import { View, Text, Icon, BaseControl } from '@databyss-org/ui/primitives'
import { pxUnits } from '@databyss-org/ui/theming/views'

const DropdownListItem = ({ menuItem, onClick }) => (
  <BaseControl
    data-test-block-menu={menuItem.action}
    // onMouseDown={onClick}
    onClick={onClick}
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
      <View flexDirection="row" alignItems="center">
        {menuItem.textSymbol && (
          <Text
            variant="uiTextSmall"
            width={pxUnits(20)}
            textAlign="center"
            mr="small"
            color="text.2"
          >
            {menuItem.textSymbol}
          </Text>
        )}
        {menuItem.icon && (
          <Icon
            sizeVariant="small"
            width={pxUnits(20)}
            mr="small"
            color="text.2"
          >
            {menuItem.icon}
          </Icon>
        )}
        <Text variant="uiTextSmall">{menuItem.label}</Text>
      </View>
      {menuItem.shortcut && (
        <Text variant="uiTextSmall" color="text.3">
          {menuItem.shortcut}
        </Text>
      )}
    </View>
  </BaseControl>
)

export default DropdownListItem
