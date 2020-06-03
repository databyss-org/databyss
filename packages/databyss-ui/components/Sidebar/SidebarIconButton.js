import React from 'react'
import { Grid, View, Icon, BaseControl } from '@databyss-org/ui/primitives'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { timing } from '@databyss-org/ui/theming/theme'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'

export const sideBarIconBtnHeight = 60

const SidebarIconButton = ({
  icon,
  onClick,
  isActive,
  borderPosition,
  ...others
}) => {
  const { isMenuOpen } = useNavigationContext()

  return (
    <>
      <View
        bg="purple.2"
        position="absolute"
        top={borderPosition}
        left="0"
        width={pxUnits(2)}
        height={pxUnits(36)}
        opacity={isActive && isMenuOpen ? 1 : 0}
        css={{
          transition: `opacity ${timing.quick}ms ${timing.ease}`,
        }}
      />
      <BaseControl
        width="100%"
        onClick={onClick}
        alignItems="center"
        height={sideBarIconBtnHeight}
        {...others}
      >
        <Grid singleRow alignItems="center" columnGap="small">
          <Icon sizeVariant="medium" color="text.3">
            {icon}
          </Icon>
        </Grid>
      </BaseControl>
    </>
  )
}

export default SidebarIconButton
