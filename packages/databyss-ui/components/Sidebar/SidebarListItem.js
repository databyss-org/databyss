import React from 'react'
import { Text, BaseControl, Grid } from '@databyss-org/ui/primitives'

const SidebarListItem = ({ isActive, text, href, icon, onPress, children }) => (
  <BaseControl
    data-test-element="page-sidebar-item"
    active={isActive}
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

export default SidebarListItem
