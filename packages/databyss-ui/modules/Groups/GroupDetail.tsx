import React, { useCallback, PropsWithChildren, useState, useRef } from 'react'
import { useParams } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import ValueListProvider, {
  ValueListItem,
} from '@databyss-org/ui/components/ValueList/ValueListProvider'
import { Group, DocumentDict, Page } from '@databyss-org/services/interfaces'
import {
  View,
  Text,
  ViewProps,
  ScrollView,
  Icon,
} from '@databyss-org/ui/primitives'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { saveGroup, UNTITLED_NAME } from '@databyss-org/services/groups'
import { usePages } from '@databyss-org/data/pouchdb/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { useDocument } from '@databyss-org/data/pouchdb/hooks/useDocument'
import GroupSvg from '@databyss-org/ui/assets/folder-open.svg'
import { debounce } from 'lodash'
import { LoadingFallback, StickyHeader, TitleInput } from '../../components'
import { PublicSharingSettings } from './PublicSharingSettings'
import GroupMenu from './GroupMenu'

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
  readOnly,
}: {
  group: Group
  pages: DocumentDict<Page> | undefined
  readOnly: boolean
}) => {
  const [values, setValues] = useState(group)
  const groupValue = useRef(group)
  const queryClient = useQueryClient()

  const saveChanges = useCallback(
    debounce((_values: Group) => saveGroup(_values), 500),
    [saveGroup]
  )

  const onChange = useCallback(
    (_values: Group) => {
      // if defaultPageId was set for this group, set it now
      if (!groupValue.current.defaultPageId) {
        _values.defaultPageId = _values.pages[0]
      }
      // if defaultPageId is no longer in pages, re-assign it
      if (
        _values.defaultPageId &&
        !_values.pages.includes(_values.defaultPageId)
      ) {
        _values.defaultPageId = _values.pages[0]
      }

      // update internal state
      setValues(_values)
      // update query cache
      queryClient.setQueryData([`useDocument_${group._id}`], _values)
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
      <View pl="medium" pr="medium" pt="none" flexGrow={1} width="100%">
        <ValueListItem path="name">
          <TitleInput
            readonly={readOnly}
            placeholder={UNTITLED_NAME}
            icon={
              <Icon>
                <GroupSvg />
              </Icon>
            }
          />
        </ValueListItem>
        <View flexGrow={1} flexBasis={1} widthVariant="form">
          <GroupSection title="Publishing">
            <PublicSharingSettings readOnly={readOnly} group={group} />
          </GroupSection>
        </View>
      </View>
    </ValueListProvider>
  )
}

export const GroupDetail = () => {
  const { id } = useParams()
  const groupRes = useDocument<Group>(id!)
  const pagesRes = usePages()
  const isReadOnly = useSessionContext((c) => c && c.isReadOnly)
  const pages = pagesRes?.data
  const group = groupRes.data

  if (!groupRes.isSuccess || !group) {
    return <LoadingFallback queryObserver={groupRes} />
  }

  return (
    <>
      <StickyHeader
        path={['Collections', group.name!]}
        contextMenu={<GroupMenu groupId={group._id} />}
      />

      <ScrollView
        p="medium"
        pt="large"
        flexGrow={1}
        flexShrink={1}
        shadowOnScroll
      >
        <GroupFields
          pages={pages}
          group={group}
          readOnly={isReadOnly}
          key={`${id}${isReadOnly}`}
        />
      </ScrollView>
    </>
  )
}
