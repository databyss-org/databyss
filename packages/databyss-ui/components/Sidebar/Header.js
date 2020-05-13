import React from 'react'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { Text, View, BaseControl, Icon } from '@databyss-org/ui/primitives'
import LogoSvg from '@databyss-org/ui/assets/logo1.svg'

const headerMap = type => {
  if (type) {
    return { pages: 'Pages', search: 'Search' }[type]
  }
  return (
    <Icon sizeVariant="title" color="text.3">
      <LogoSvg />
    </Icon>
  )
}

const Header = ({ onHeaderClick }) => {
  const { getSidebarPath } = useNavigationContext()
  const menuItem = getSidebarPath()

  return (
    <BaseControl p={1} width="100%" onClick={() => onHeaderClick()}>
      <View>
        <Text variant="uiTextLarge">{headerMap(menuItem)}</Text>
      </View>
    </BaseControl>
  )
}

export default Header
