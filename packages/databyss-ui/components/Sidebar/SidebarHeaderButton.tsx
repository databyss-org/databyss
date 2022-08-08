import React from 'react'
import { Text, View } from '../..'
import BaseControl from '../../primitives/Control/BaseControl'

export const SidebarHeaderButton = ({ label, active, onPress, ...others }) => {
  const props = {
    alignItems: 'center',
    justifyContent: 'center',
    py: 'tiny',
    px: 'small',
    borderRadius: 'default',
    borderVariant: 'thinDark',
    bg: active ? 'border.1' : 'transparent',
    borderColor: 'border.1',
    ...(!active
      ? {
          onPress,
        }
      : {}),
    ...others,
  }
  const Component = active ? View : BaseControl
  return (
    <Component {...props}>
      <Text
        variant="uiTextSmallCaps"
        color="text.2"
        css={{ userSelect: 'none' }}
      >
        {label}
      </Text>
    </Component>
  )
}
