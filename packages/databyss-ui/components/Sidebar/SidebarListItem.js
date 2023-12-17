import React, { useImperativeHandle, useRef } from 'react'
import { Text, BaseControl, View, Icon } from '@databyss-org/ui/primitives'
import { pxUnits } from '../../theming/views'
import { withKeyboardNavigation } from '../../primitives/List/KeyboardNavigationItem'
import { useDocument } from '@databyss-org/data/pouchdb/hooks/useDocument'

export const SidebarListRow = ({
  children,
  text,
  icon,
  isActive,
  ...others
}) => (
  <View
    width="100%"
    flexDirection="row"
    alignItems="center"
    justifyContent="space-between"
    {...others}
  >
    <View flexDirection="row" flexWrap="nowrap" maxWidth="100%" flexShrink={1}>
      <Icon
        sizeVariant="tiny"
        color={others.iconColor ?? (isActive ? 'text.1' : 'text.3')}
        mt={pxUnits(2)}
        mr="small"
      >
        {icon}
      </Icon>
      <Text
        variant="uiTextSmall"
        color={isActive ? 'text.1' : 'text.3'}
        userSelect="none"
      >
        {text}
      </Text>
    </View>
    {children}
  </View>
)

const SidebarListItem = ({
  isActive,
  text,
  data,
  href,
  icon,
  onPress,
  children,
  activeNavigationItem,
  navigationItemRef,
  navigationItemHandle,
  draggable,
  ...others
}) => {
  const docRes = useDocument(data?._id, {
    enabled: data !== null,
  })
  // console.log(docRes.data)
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

  const _text =
    docRes.data?.name?.textValue ??
    docRes.data?.name ??
    docRes.data?.text?.textValue ??
    text

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
      <SidebarListRow isActive={isActive} icon={icon} text={_text} {...others}>
        {children}
      </SidebarListRow>
    </BaseControl>
  )
}

export default withKeyboardNavigation(SidebarListItem)
