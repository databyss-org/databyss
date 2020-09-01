import React from 'react'
import { Text, BaseControl } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'

const Header = () => {
  const { navigateSidebar } = useNavigationContext()

  const onHeaderClick = () => {
    navigateSidebar('/')
  }

  return (
    <BaseControl
      width="100%"
      onClick={() => onHeaderClick()}
      px="em"
      mb="extraSmall"
    >
      <Text variant="heading4" color="text.3">
        Databyss
      </Text>
    </BaseControl>
  )
}

export default Header
