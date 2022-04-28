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
  Button,
  Icon,
  List,
} from '@databyss-org/ui/primitives'
import ExternalLinkSvg from '@databyss-org/ui/assets/external-link.svg'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { saveGroup, UNTITLED_NAME } from '@databyss-org/services/groups'
import { useGroups, usePages } from '@databyss-org/data/pouchdb/hooks'
import { urlSafeName } from '@databyss-org/services/lib/util'
import { debounce } from 'lodash'
import { LoadingFallback, StickyHeader, TitleInput } from '../../components'
import { PageDropzone } from './PageDropzone'
import { PublicSharingSettings } from './PublicSharingSettings'
import { darkTheme } from '../../theming/theme'
import { copyToClipboard } from '../../components/PageContent/PageMenu'
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

export const DetailPanel = ({ children, ...others }) => (
  <List
    bg="background.2"
    horizontalItemPadding="em"
    verticalItemPadding="small"
    borderRadius="default"
    {...others}
  >
    {children}
  </List>
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

  const saveChanges = useCallback(
    debounce((_values: Group) => saveGroup(_values), 500),
    [saveGroup]
  )

  // compose link
  const _groupName = group.name ? `${urlSafeName(group.name)}-` : ''
  const _groupUrl = `${window.location.protocol}//${
    window.location.host
  }/${_groupName}${group._id.substring(2)}`

  const copyLink = () => {
    // TODO: collection should only be linkable if page exist

    copyToClipboard(_groupUrl)
  }

  const onChange = useCallback(
    (_values: Group) => {
      // if change occured in group public status
      // if (groupValue.current.public !== _values.public) {
      //   setGroupAction(
      //     group._id,
      //     _values.public ? GroupAction.MAKE_PUBLIC : GroupAction.MAKE_PRIVATE
      //   )
      // }
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
          <TitleInput readonly={readOnly} placeholder={UNTITLED_NAME} />
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
            <GroupSection title="Open Collection in New Tab">
              <DetailPanel>
                <Grid
                  singleRow
                  flexWrap="nowrap"
                  columnGap="tiny"
                  alignItems="flex-start"
                >
                  <Icon sizeVariant="tiny" color="text.1" mt="tiny">
                    <ExternalLinkSvg />
                  </Icon>
                  <Button
                    flexShrink={1}
                    variant="uiLink"
                    textVariant="uiTextSmall"
                    href={_groupUrl}
                    target="_blank"
                  >
                    {_groupUrl}
                  </Button>
                </Grid>
              </DetailPanel>
            </GroupSection>
            <GroupSection title="Share with Everyone">
              <ValueListItem path="public">
                <PublicSharingSettings readOnly={readOnly} onClick={copyLink} />
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
  const isReadOnly = useSessionContext((c) => c && c.isReadOnly)

  const pages = pagesRes?.data

  const group = groupsRes.data?.[id!]

  if (!groupsRes.isSuccess || !group) {
    return <LoadingFallback queryObserver={groupsRes} />
  }

  return (
    <>
      <StickyHeader
        path={['Collections', group.name!]}
        contextMenu={<GroupMenu groupId={group._id} />}
      />

      <ScrollView
        p="medium"
        pt="small"
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
