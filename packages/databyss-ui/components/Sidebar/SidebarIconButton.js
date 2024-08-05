import React from 'react'

import {
  Grid,
  View,
  Icon,
  BaseControl,
  Text,
} from '@databyss-org/ui/primitives'
import HamburgerSvg from '@databyss-org/ui/assets/hamburger.svg'
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
    width: pxUnits(3),
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
  sizeVariant,
  badgeText,
  hamburger,
  ...others
}) => (
  <>
    <BaseControl
      data-test-sidebar-element={name}
      borderTopColor={seperatorTop && 'border.2'}
      alignItems="center"
      onClick={onClick}
      // width="100%"
      position="relative"
      hoverColor="background.2"
      {...others}
    >
      <View bg="purple.1" css={getDotStyles(isActive, isBottomNav)} />
      <Grid
        singleRow
        css={getGridStyles(isBottomNav)}
        position="relative"
        zIndex="1"
      >
        <Icon
          sizeVariant={sizeVariant}
          color={getIconColor(isActive, isBottomNav)}
          title={title}
        >
          {icon}
        </Icon>
      </Grid>
      {badgeText && (
        <View
          position="absolute"
          zIndex="0"
          top={pxUnits(4)}
          right={pxUnits(4)}
          borderRadius="round"
          bg="purple.1"
          minWidth={16}
          height={16}
          px={pxUnits(4)}
          justifyContent="center"
          alignItems="center"
        >
          <Text variant="uiTextTiny" color="white">
            {badgeText}
          </Text>
        </View>
      )}
      {hamburger && (
        <Icon
          position="absolute"
          zIndex="0"
          bottom={pxUnits(4)}
          right={pxUnits(4)}
          sizeVariant="tiny"
          color="gray.4"
        >
          <HamburgerSvg />
        </Icon>
      )}
    </BaseControl>
  </>
)

SidebarIconButton.defaultProps = {
  sizeVariant: 'medium',
}

export default SidebarIconButton
