import React, { useCallback, PropsWithChildren, useState } from 'react'
import { useParams } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import ValueListProvider, {
  ValueListItem,
} from '@databyss-org/ui/components/ValueList/ValueListProvider'
import { Group } from '@databyss-org/services/interfaces'
import {
  View,
  Text,
  Grid,
  ViewProps,
  ScrollView,
} from '@databyss-org/ui/primitives'
import { saveGroup } from '@databyss-org/services/groups'
import { useGroups } from '@databyss-org/data/pouchdb/hooks'
import { LoadingFallback, StickyHeader, TitleInput } from '../../components'
import { PageDropzone } from './PageDropzone'
import { PublicSharingSettings } from './PublicSharingSettings'
import { darkTheme } from '../../theming/theme'

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

  const onChange = useCallback(
    (_values) => {
      // update internal state
      setValues(_values)
      // update database
      saveGroup(group)
    },
    [saveGroup]
  )

  return (
    <ValueListProvider onChange={onChange} values={values}>
      <View pl="em" pr="medium" pt="none" flexGrow={1}>
        <ValueListItem path="name">
          <TitleInput placeholder="untitled" />
        </ValueListItem>
        <Grid columnGap="large" widthVariant="content" flexGrow={1}>
          <GroupSection title="Pages" flexGrow={1} flexBasis={1}>
            <View theme={darkTheme} flexGrow={1}>
              <ValueListItem path="pages">
                <PageDropzone bg="background.2" height="100%" />
              </ValueListItem>
            </View>
          </GroupSection>
          <View flexGrow={1} flexBasis={1}>
            <GroupSection title="Share with Everyone">
              <ValueListItem path="public">
                <PublicSharingSettings />
              </ValueListItem>
            </GroupSection>
          </View>
        </Grid>
      </View>
    </ValueListProvider>
  )
}

export const GroupDetail = () => {
  const { id } = useParams()
  const groupsRes = useGroups()

  if (!groupsRes.isSuccess) {
    return <LoadingFallback queryObserver={groupsRes} />
  }

  const group = groupsRes!.data[id]

  return (
    <>
      <StickyHeader path={['Collections', group.name]} />
      <ScrollView
        p="medium"
        pt="small"
        flexGrow={1}
        flexShrink={1}
        shadowOnScroll
      >
        <GroupFields group={group} />
      </ScrollView>
    </>
  )
}
