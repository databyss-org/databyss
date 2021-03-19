import React, { useCallback, PropsWithChildren, useState, useRef } from 'react'
import { useParams } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import ValueListProvider, {
  ValueListItem,
} from '@databyss-org/ui/components/ValueList/ValueListProvider'
import { Group, DocumentDict, Page } from '@databyss-org/services/interfaces'
import {
  View,
  Text,
  Grid,
  ViewProps,
  ScrollView,
} from '@databyss-org/ui/primitives'
import { saveGroup, UNTITLED_NAME } from '@databyss-org/services/groups'
import { useGroups, usePages } from '@databyss-org/data/pouchdb/hooks'
import { debounce } from 'lodash'
import { updateAndReplicateSharedDatabase } from '@databyss-org/data/pouchdb/groups/index'
import { LoadingFallback, StickyHeader, TitleInput } from '../../components'
import { PageDropzone } from './PageDropzone'
import { PublicSharingSettings } from './PublicSharingSettings'
import { darkTheme } from '../../theming/theme'
import { copyToClipboard } from '../../components/PageContent/PageMenu'

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

export const GroupFields = ({
  group,
  pages,
}: {
  group: Group
  pages: DocumentDict<Page> | undefined
}) => {
  const [values, setValues] = useState(group)
  const groupValue = useRef(group)

  const saveChanges = useCallback(
    debounce((_values: Group) => saveGroup(_values), 500),
    [saveGroup]
  )

  const copyLink = () => {
    // TODO: collection should only be linkable if page exist

    // compose public link
    const getUrl = window.location
    const baseUrl = `${getUrl.protocol}//${getUrl.host}/${group._id}/pages/${groupValue.current.pages[0]}`

    copyToClipboard(baseUrl)
  }

  const onChange = useCallback(
    (_values: Group) => {
      // if change occured in group public status
      if (groupValue.current.public !== _values.public) {
        updateAndReplicateSharedDatabase({
          groupId: group._id,
          isPublic: _values.public!,
        })
      }
      // update internal state
      setValues(_values)
      // update database
      saveChanges(_values)
      // update ref values
      groupValue.current = _values
    },
    [setValues, values]
  )

  const _values = { ...values }
  if (_values.name === UNTITLED_NAME) {
    _values.name = ''
  }

  return (
    <ValueListProvider onChange={onChange} values={_values}>
      <View pl="em" pr="medium" pt="none" flexGrow={1}>
        <ValueListItem path="name">
          <TitleInput placeholder={UNTITLED_NAME} />
        </ValueListItem>
        <Grid columnGap="large" widthVariant="content" flexGrow={1}>
          <GroupSection title="Pages" flexGrow={1} flexBasis={1}>
            <View theme={darkTheme} flexGrow={1}>
              <ValueListItem path="pages" pages={pages} group={group}>
                <PageDropzone
                  pages={pages}
                  group={group}
                  bg="background.2"
                  height="100%"
                />
              </ValueListItem>
            </View>
          </GroupSection>
          <View flexGrow={1} flexBasis={1}>
            <GroupSection title="Share with Everyone">
              <ValueListItem path="public">
                <PublicSharingSettings onClick={copyLink} />
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
  const pagesRes = usePages()

  const pages = pagesRes?.data

  const group = groupsRes.data?.[id]

  if (!groupsRes.isSuccess || !group) {
    return <LoadingFallback queryObserver={groupsRes} />
  }
  return (
    <>
      <StickyHeader path={['Collections', group.name!]} />
      <ScrollView
        p="medium"
        pt="small"
        flexGrow={1}
        flexShrink={1}
        shadowOnScroll
      >
        <GroupFields pages={pages} group={group} key={id} />
      </ScrollView>
    </>
  )
}
