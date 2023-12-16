import React from 'react'
import { TextInput, View } from '@databyss-org/ui/primitives'
import { useDocument } from '@databyss-org/data/pouchdb/hooks/useDocument'
import { dbRef } from '@databyss-org/data/pouchdb/dbRef'
import { Group } from '@databyss-org/services/interfaces'
import LoadingFallback from '../Notify/LoadingFallback'
import { pxUnits } from '../../theming/views'

const Header = () => {
  const groupRes = useDocument<Group>(dbRef.groupId ?? '', {
    enabled: dbRef.groupId !== null,
  })

  if (!groupRes.isSuccess) {
    return <LoadingFallback queryObserver={groupRes} />
  }

  const _groupName = groupRes.data.name

  return (
    <View
      height={pxUnits(60)}
      css={{
        justifyContent: 'center',
      }}
      bg="gray.1"
    >
      <TextInput
        variant="uiTextMediumSemibold"
        color="text.3"
        px="em"
        value={{ textValue: _groupName || 'Databyss' }}
        // value={{ textValue: 'Very long Databyss name' }}
      />
    </View>
  )
}

export default Header
