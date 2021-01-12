import React from 'react'
import { View, Text } from '@databyss-org/ui/primitives'
import { useParams } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { Group } from '@databyss-org/services/interfaces'
import { GroupLoader } from '../../components/Loaders'
import { StickyHeader } from '../../components'

export const GroupDetail = () => {
  const { id } = useParams()
  return (
    <GroupLoader groupId={id}>
      {(group: Group) => <StickyHeader path={['Collections', group.name]} />}
    </GroupLoader>
  )
}
