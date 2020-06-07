import React from 'react'
import { Grid, View, Icon, BaseControl } from '@databyss-org/ui/primitives'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { timing } from '@databyss-org/ui/theming/theme'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { sidebar } from '../../theming/components'

const SidebarIconButton = ({
  icon,
  onClick,
  isActive,
  borderPosition,
  title,
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
        height={sidebar.iconBtnHeight}
        {...others}
      >
        <Grid singleRow alignItems="center" columnGap="small">
          <Icon sizeVariant="medium" color="text.3" title={title}>
            {icon}
          </Icon>
        </Grid>
      </BaseControl>
    </>
  )
}

export default SidebarIconButton
