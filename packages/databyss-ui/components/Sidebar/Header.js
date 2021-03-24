import React from 'react'
import { Text, BaseControl } from '@databyss-org/ui/primitives'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { useGroups } from '@databyss-org/data/pouchdb/hooks'
import { pxUnits } from '../../primitives'
import LoadingFallback from '../Notify/LoadingFallback'

const Header = () => {
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)

  const groupRes = useGroups()

  if (!groupRes.isSuccess) {
    return <LoadingFallback queryObserver={groupRes} />
  }
  // a public account will only have one group associated with it
  const _groupName = Object.values(groupRes.data)?.[0]?.name || 'Databyss'

  console.log(_groupName)
  return (
    <BaseControl
      href={isPublicAccount() ? 'https://www.databyss.org' : '/'}
      px="em"
      mt={pxUnits(11)}
      mb="extraSmall"
    >
      <Text variant="heading4" color="text.3">
        {_groupName}
      </Text>
    </BaseControl>
  )
}

export default Header
