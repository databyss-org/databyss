import React from 'react'
import { Text, BaseControl } from '@databyss-org/ui/primitives'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { urlSafeName } from '@databyss-org/services/lib/util'
import { useGroups } from '@databyss-org/data/pouchdb/hooks'
import { pxUnits } from '../..'
import LoadingFallback from '../Notify/LoadingFallback'

const Header = () => {
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)
  const getSession = useSessionContext((c) => c && c.getSession)

  const { defaultGroupId, defaultGroupName, defaultPageId } = getSession()

  const groupRes = useGroups()

  if (!groupRes.isSuccess) {
    return <LoadingFallback queryObserver={groupRes} />
  }
  // a public account will only have one group associated with it
  const _groupName = Object.values(groupRes.data)?.[0]?.name || 'Databyss'

  let _urlGroupName = ''
  if (defaultGroupName) {
    _urlGroupName = `${urlSafeName(defaultGroupName)}-`
  }

  return (
    <BaseControl
      href={
        isPublicAccount()
          ? `/${_urlGroupName}${defaultGroupId.substring(
              2
            )}/pages/${defaultPageId}`
          : '/'
      }
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
