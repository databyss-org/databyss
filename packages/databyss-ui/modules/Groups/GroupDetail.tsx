import React from 'react'
import { View, Text } from '@databyss-org/ui/primitives'
import { useParams } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { Group } from '@databyss-org/services/interfaces'
import { GroupLoader } from '../../components/Loaders'

export const GroupDetail = () => {
  const { id } = useParams()
  return (
    <GroupLoader groupId={id}>
      {(group: Group) => <Text>{group.name}</Text>}
    </GroupLoader>
  )
}
