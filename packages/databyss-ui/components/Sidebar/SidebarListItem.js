import React, { useImperativeHandle, useRef } from 'react'
import {
  Text,
  BaseControl,
  Grid,
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
      py="small"
      px="em"
      width="100%"
      href={href}
      onPress={onPress}
      childViewProps={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
      css={{
        textDecoration: 'none',
        boxSizing: 'border-box',
      }}
      active={isActive || activeNavigationItem}
      ref={navigationItemRef}
      handle={_controlHandle}
    >
      <Grid singleRow flexWrap="nowrap" columnGap="small" maxWidth="100%">
        {icon}
        <Text variant="uiTextSmall" color={isActive ? 'text.1' : 'text.3'}>
          {text}
        </Text>
      </Grid>
      {children}
    </BaseControl>
  )
}

export default withKeyboardNavigation(SidebarListItem)
