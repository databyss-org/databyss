import React, { useImperativeHandle, useRef } from 'react'
import {
  Text,
  BaseControl,
  Grid,
  View,
  Icon,
  withKeyboardNavigation,
  pxUnits,
} from '@databyss-org/ui/primitives'

export const SidebarListRow = ({ children, text, icon, isActive }) => (
  <View
    py="small"
    px="em"
    width="100%"
    flexDirection="row"
    alignItems="center"
    justifyContent="space-between"
  >
    <Grid singleRow flexWrap="nowrap" columnGap="small" maxWidth="100%">
      <Icon
        sizeVariant="tiny"
        color={isActive ? 'text.1' : 'text.3'}
        mt={pxUnits(2)}
      >
        {icon}
      </Icon>
      <Text variant="uiTextSmall" color={isActive ? 'text.1' : 'text.3'}>
        {text}
      </Text>
    </Grid>
    {children}
  </View>
)

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
      <SidebarListRow isActive={isActive} icon={icon} text={text}>
        {children}
      </SidebarListRow>
    </BaseControl>
  )
}

export default withKeyboardNavigation(SidebarListItem)
