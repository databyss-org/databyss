import React from 'react'
import { Text, BaseControl } from '@databyss-org/ui/primitives'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { useGroups, usePages } from '@databyss-org/data/pouchdb/hooks'
import { pxUnits } from '../..'
import LoadingFallback from '../Notify/LoadingFallback'

const Header = () => {
  const getSession = useSessionContext((c) => c && c.getSession)
  const getDefaultPageUrl = useSessionContext((c) => c && c.getDefaultPageUrl)
  const pagesRes = usePages()

  const { defaultGroupId, defaultGroupName } = getSession()

  const groupRes = useGroups()

  const queryRes = [pagesRes, groupRes]

  if (queryRes.some((q) => !q.isSuccess)) {
    return <LoadingFallback queryObserver={queryRes} />
  }
  // a public account will only have one group associated with it
  const _groupName = Object.values(groupRes.data)?.[0]?.name

  return (
    <BaseControl
      href={
        _groupName
          ? getDefaultPageUrl({
              pages: pagesRes.data,
              defaultGroupId,
              defaultGroupName,
            })
          : 'https://www.databyss.org'
      }
      px="em"
      mt={pxUnits(11)}
      mb="extraSmall"
    >
      <Text variant="heading4" color="text.3">
        {_groupName || 'Databyss'}
      </Text>
    </BaseControl>
  )
}

export default Header
