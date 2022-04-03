import React from 'react'
import { Text, BaseControl } from '@databyss-org/ui/primitives'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { urlSafeName } from '@databyss-org/services/lib/util'
import { useGroups, usePages } from '@databyss-org/data/pouchdb/hooks'
import { pxUnits } from '../..'
import LoadingFallback from '../Notify/LoadingFallback'

const Header = () => {
  const getSession = useSessionContext((c) => c && c.getSession)
  const pagesRes = usePages()

  const { defaultGroupId, defaultGroupName, defaultPageId } = getSession()

  const groupRes = useGroups()

  if (!groupRes.isSuccess) {
    return <LoadingFallback queryObserver={groupRes} />
  }
  // a public account will only have one group associated with it
  const _groupName = Object.values(groupRes.data)?.[0]?.name

  let _urlGroupName = ''
  if (defaultGroupName) {
    _urlGroupName = `${urlSafeName(defaultGroupName)}-`
  }

  let _pageUrl = defaultPageId
  if (_groupName && pagesRes.data?.[defaultPageId]?.name) {
    _pageUrl = `${defaultPageId}/${urlSafeName(
      pagesRes.data[defaultPageId].name
    )}`
  }

  return (
    <BaseControl
      href={
        _groupName
          ? `/${_urlGroupName}${defaultGroupId.substring(2)}/pages/${_pageUrl}`
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
