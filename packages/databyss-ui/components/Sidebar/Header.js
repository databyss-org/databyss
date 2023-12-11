import React from 'react'
import { Text, TextInput } from '@databyss-org/ui/primitives'
import { useGroups, usePages } from '@databyss-org/data/pouchdb/hooks'
import LoadingFallback from '../Notify/LoadingFallback'
import { pxUnits } from '../../theming/views'

const Header = () => {
  // const getSession = useSessionContext((c) => c && c.getSession)
  // const getDefaultPageUrl = useSessionContext((c) => c && c.getDefaultPageUrl)
  const pagesRes = usePages()

  const groupRes = useGroups()

  const queryRes = [pagesRes, groupRes]

  if (queryRes.some((q) => !q.isSuccess)) {
    return <LoadingFallback queryObserver={queryRes} />
  }
  // a public account will only have one group associated with it
  const _groupName = Object.values(groupRes.data)?.[0]?.name

  return (
    <TextInput
      variant="uiTextLargeSemibold"
      bg="gray.1"
      color="text.3"
      px="em"
      pt="em"
      pb="em"
      mb={pxUnits(2)}
      height="2em"
      css={{
        display: 'flex',
        alignItems: 'center',
      }}
      value={{ textValue: _groupName || 'Databyss' }}
    />
  )
}

export default Header
