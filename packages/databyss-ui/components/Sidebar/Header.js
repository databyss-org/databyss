import React from 'react'
import { Text, View, Icon, BaseControl } from '@databyss-org/ui/primitives'
import LogoSvg from '@databyss-org/ui/assets/logo1.svg'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'

const Header = () => {
  const { navigateSidebar } = useNavigationContext()
  const onHeaderClick = () => {
    navigateSidebar('/')
  }

  return (
    <BaseControl width="100%" onClick={() => onHeaderClick()}>
      <View px="em" width="100%">
        <Text variant="heading4" color="text.3">
          Databyss
        </Text>
      </View>
    </BaseControl>
  )
}

export default Header
