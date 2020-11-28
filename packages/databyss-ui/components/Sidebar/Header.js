import React from 'react'
import { Text, BaseControl } from '@databyss-org/ui/primitives'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'

const Header = () => {
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)

  return (
    <BaseControl
      href={isPublicAccount() ? 'https://www.databyss.org' : '/'}
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
