import React, { useCallback, PropsWithChildren, useState } from 'react'
import { useParams } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import ValueListProvider, {
  ValueListItem,
} from '@databyss-org/ui/components/ValueList/ValueListProvider'
import { Group } from '@databyss-org/services/interfaces'
import { useGroupContext } from '@databyss-org/services/groups/GroupProvider'
import {
  View,
  Text,
  TextInput,
  Grid,
  ViewProps,
} from '@databyss-org/ui/primitives'
import { GroupLoader } from '../../components/Loaders'
import { StickyHeader, TitleInput } from '../../components'

interface GroupSectionProps extends ViewProps {
  title: string
}
const GroupSection = ({
  title,
  children,
  ...others
}: PropsWithChildren<GroupSectionProps>) => (
  <View mt="medium" {...others}>
    <Text variant="uiTextHeading" color="text.2" mb="small">
      {title}
    </Text>
    {children}
  </View>
)

export const GroupFields = ({ group }: { group: Group }) => {
  const [values, setValues] = useState(group)
  const { setGroup } = useGroupContext()

  const onChange = useCallback(
    (_values) => {
      // update internal state
      setValues(_values)
      // update database
      setGroup(group._id, (oldGroup) => {
        const _updated = Object.assign({}, oldGroup, _values)
        return _updated
      })
    },
    [setGroup]
  )

  return (
    <ValueListProvider onChange={onChange} values={values}>
      <View px="medium" pt="none" flexGrow={1} widthVariant="content">
        <ValueListItem path="name">
          <TitleInput placeholder="untitled" />
        </ValueListItem>
        <GroupSection title="Description">
          <View borderVariant="thinLight">
            <ValueListItem path="description">
              <TextInput
                p="small"
                multiline
                maxRows={10}
                variant="uiTextSmall"
                placeholder="Type a description of your shared or public collection"
              />
            </ValueListItem>
          </View>
        </GroupSection>
        <Grid columnGap="large">
          <GroupSection title="Pages">pages</GroupSection>
          <GroupSection title="Share with Everyone">pages</GroupSection>
        </Grid>
      </View>
    </ValueListProvider>
  )
}

export const GroupDetail = () => {
  const { id } = useParams()

  return (
    <GroupLoader groupId={id}>
      {(group: Group) => (
        <>
          <StickyHeader path={['Collections', group.name]} />
          <GroupFields group={group} />
        </>
      )}
    </GroupLoader>
  )
}
