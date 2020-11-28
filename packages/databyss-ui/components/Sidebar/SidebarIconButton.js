import React from 'react'

import { Grid, View, Icon, BaseControl } from '@databyss-org/ui/primitives'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { timing } from '@databyss-org/ui/theming/theme'

const getDotStyles = (isActive, isBottomNav) => {
  const commonStyles = {
    position: 'absolute',
    opacity: isActive ? 1 : 0,
    transition: `opacity ${timing.quick}ms ${timing.ease}`,
  }

  if (isBottomNav) {
    return Object.assign(commonStyles, {
      height: pxUnits(3),
      left: '50%',
      marginLeft: pxUnits(-16),
      top: pxUnits(-1),
      width: pxUnits(32),
    })
  }
  return Object.assign(commonStyles, {
    bottom: pxUnits(8),
    left: 0,
    top: pxUnits(8),
    width: pxUnits(2),
  })
}

const getGridStyles = (isBottomNav) => {
  const commonStyles = {
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 'small',
  }

  if (isBottomNav) {
    return Object.assign(commonStyles, {
      height: pxUnits(50), // nav bar height
    })
  }
  return commonStyles
}

const getIconColor = (isActive, isBottomNav) => {
  const inactiveColor = 'text.3'

  if (isBottomNav) {
    return isActive ? 'text.6' : inactiveColor
  }
  return isActive ? 'text.2' : inactiveColor
}

// component
const SidebarIconButton = ({
  icon,
  isActive,
  isBottomNav,
  name,
  onClick,
  title,
  seperatorTop,
  ...others
}) => (
  <>
    <BaseControl
      data-test-sidebar-element={name}
      borderTopColor={seperatorTop && 'border.1'}
      alignItems="center"
      onClick={onClick}
      width="100%"
      {...others}
    >
      <View bg="purple.2" css={getDotStyles(isActive, isBottomNav)} />
      <Grid singleRow css={getGridStyles(isBottomNav)}>
        <Icon
          sizeVariant="medium"
          color={getIconColor(isActive, isBottomNav)}
          title={title}
        >
          {icon}
        </Icon>
      </Grid>
    </BaseControl>
  </>
)

export default SidebarIconButton
