import React from 'react'
import { Text, View, Icon } from '@databyss-org/ui/primitives'
import LogoSvg from '@databyss-org/ui/assets/logo1.svg'

const Header = () => (
  <View px={2} py={1} width="100%">
    <Text variant="uiTextLarge">
      <Icon sizeVariant="title" color="text.3">
        <LogoSvg />
      </Icon>
    </Text>
  </View>
)

export default Header
