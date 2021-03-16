import React, { useCallback, PropsWithChildren, useState, useRef } from 'react'
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
import { saveGroup, UNTITLED_NAME } from '@databyss-org/services/groups'
import { useGroups } from '@databyss-org/data/pouchdb/hooks'
import { debounce } from 'lodash'
import {
  addGroupToDocumentsFromPage,
  addOrRemoveCloudantGroupDatabase,
  replicateGroup,
  addPageToGroup,
} from '@databyss-org/data/pouchdb/groups/index'
import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import { LoadingFallback, StickyHeader, TitleInput } from '../../components'
import { PageDropzone } from './PageDropzone'
import { PublicSharingSettings } from './PublicSharingSettings'
import { darkTheme } from '../../theming/theme'
import { findOne } from '../../../databyss-data/pouchdb/utils'
import { PageDoc } from '../../../databyss-data/pouchdb/interfaces'

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
  const groupValue = useRef(group)

  const saveChanges = useCallback(
    debounce((_values: Group) => saveGroup(_values), 500),
    [saveGroup]
  )

  const addPageDocumentToGroup = async ({ pageId }: { pageId: string }) => {
    // add groupId to page document
    await addPageToGroup({ pageId, groupId: `g_${group._id}` })
    // get updated pageDoc
    const _page: PageDoc | null = await findOne({
      doctype: DocumentType.Page,
      query: { _id: pageId },
    })
    if (_page) {
      // add propagate sharedWithGroups property to all documents
      await addGroupToDocumentsFromPage(_page)
      // get group shared status
      const { _id: groupId, public: isPublic } = groupValue.current
      // one time upsert to remote db
      if (isPublic) {
        replicateGroup({ groupId: `g_${groupId}`, isPublic })
      }
    }
  }

  const onChange = useCallback(
    (_values: Group) => {
      // if change occured in group public status
      if (groupValue.current.public !== _values.public) {
        // create or delete a database
        addOrRemoveCloudantGroupDatabase({
          groupId: `g_${group._id}`,
          isPublic: _values.public!,
        }).then(() => {
          // if group was just made public, publish all associated pages
          if (groupValue.current.public) {
            replicateGroup({
              groupId: `g_${group._id}`,
              isPublic: true,
            })
          }
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

  const removePageFromGroup = (pageId: string) => {
    // remove groupId from all documents assosicated with pageId

    // reset shared DB to reflect updated DB
    console.log('removed', pageId)
  }

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
              <ValueListItem path="pages">
                <PageDropzone
                  bg="background.2"
                  height="100%"
                  removePageFromGroup={removePageFromGroup}
                  addPageDocumentToGroup={addPageDocumentToGroup}
                />
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
        <GroupFields group={group} key={id} />
      </ScrollView>
    </>
  )
}
