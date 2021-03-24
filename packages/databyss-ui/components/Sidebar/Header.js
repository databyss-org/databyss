import React from 'react'
import { Text, BaseControl } from '@databyss-org/ui/primitives'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { pxUnits } from '../../primitives'

const Header = () => {
  console.log('HEADER')
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)

  return (
    <BaseControl
      href={isPublicAccount() ? 'https://www.databyss.org' : '/'}
      px="em"
      mt={pxUnits(11)}
      mb="extraSmall"
    >
      <Text variant="heading4" color="text.3">
        Databyss
      </Text>
    </BaseControl>
  )
}

export default Header
