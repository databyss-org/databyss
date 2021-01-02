import React, { useImperativeHandle, useRef } from 'react'
import {
  Text,
  BaseControl,
  Grid,
  View,
  withKeyboardNavigation,
} from '@databyss-org/ui/primitives'

const SidebarListItem = ({
  isActive,
  text,
  href,
  icon,
  onPress,
  children,
  activeNavigationItem,
  navigationItemRef,
  navigationItemHandle,
  draggable,
}) => {
  const _controlHandle = useRef()
  useImperativeHandle(navigationItemHandle, () => ({
    selectNavigationItem: () => {
      if (href) {
        _controlHandle.current.press()
      } else {
        onPress()
      }
    },
  }))

  return (
    <BaseControl
      data-test-element="page-sidebar-item"
      href={href}
      onPress={onPress}
      active={isActive || activeNavigationItem}
      ref={navigationItemRef}
      handle={_controlHandle}
      draggable={draggable}
    >
      <View
        py="small"
        px="em"
        width="100%"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Grid singleRow flexWrap="nowrap" columnGap="small" maxWidth="100%">
          {icon}
          <Text variant="uiTextSmall" color={isActive ? 'text.1' : 'text.3'}>
            {text}
          </Text>
        </Grid>
        {children}
      </View>
    </BaseControl>
  )
}

export default withKeyboardNavigation(SidebarListItem)
