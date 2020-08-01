import React from 'react'
import { Grid, View, Icon, BaseControl } from '@databyss-org/ui/primitives'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { timing } from '@databyss-org/ui/theming/theme'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'

const SidebarIconButton = ({ icon, onClick, isActive, title, ...others }) => {
  const { isMenuOpen } = useNavigationContext()

  return (
    <>
      <BaseControl
        width="100%"
        onClick={onClick}
        alignItems="center"
        {...others}
      >
        <View
          bg="purple.2"
          position="absolute"
          top="small"
          bottom="small"
          left="0"
          width={pxUnits(2)}
          opacity={isActive && isMenuOpen ? 1 : 0}
          css={{
            transition: `opacity ${timing.quick}ms ${timing.ease}`,
          }}
        />
        <Grid singleRow alignItems="center" columnGap="small">
          <Icon
            sizeVariant="medium"
            color={isActive && isMenuOpen ? 'text.2' : 'text.3'}
            title={title}
          >
            {icon}
          </Icon>
        </Grid>
      </BaseControl>
    </>
  )
}

export default SidebarIconButton
