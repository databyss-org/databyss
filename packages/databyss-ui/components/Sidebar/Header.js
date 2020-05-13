import React from 'react'
import { Text, View, BaseControl, Icon } from '@databyss-org/ui/primitives'
import LogoSvg from '@databyss-org/ui/assets/logo1.svg'

const Header = ({ onHeaderClick }) => (
  <BaseControl p={1} width="100%" onClick={() => onHeaderClick()}>
    <View>
      <Text variant="uiTextLarge">
        <Icon sizeVariant="title" color="text.3">
          <LogoSvg />
        </Icon>
      </Text>
    </View>
  </BaseControl>
)

export default Header
