import React, {
  useCallback,
  PropsWithChildren,
  useState,
  useRef,
  useEffect,
} from 'react'
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
  TextInput,
  Grid,
  Separator,
  Button,
} from '@databyss-org/ui/primitives'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { saveGroup, UNTITLED_NAME } from '@databyss-org/services/groups'
import { usePages } from '@databyss-org/data/pouchdb/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { useDocument } from '@databyss-org/data/pouchdb/hooks/useDocument'
import GroupSvg from '@databyss-org/ui/assets/folder-open.svg'
import { debounce } from 'lodash'
import {
  LoadingFallback,
  StickyHeader,
  TitleInput,
} from '@databyss-org/ui/components'
import { makePublicUrl, PublicSharingSettings } from './PublicSharingSettings'
import GroupMenu from './GroupMenu'
import { PageDropzone } from './PageDropzone'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { useDatabaseContext } from '@databyss-org/services/lib/DatabaseProvider'

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
  const valuesRef = useRef<Group>(group)
  const groupValue = useRef(group)
  const setGroup = useDatabaseContext((c) => c && c.setGroup)

  const saveChanges = useCallback(
    debounce(() => setGroup(valuesRef.current), 500),
    [setGroup]
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
      valuesRef.current = _values

      // update database
      saveChanges()
      // update ref values
      groupValue.current = _values
    },
    [setValues, values]
  )

  const onSetDefaultPage = useCallback(
    (_id: string) => {
      const _nextValues = { ...values }
      _nextValues.defaultPageId = _id
      onChange(_nextValues)
    },
    [onChange, group, values]
  )

  useEffect(() => {
    onChange(group)
  }, [group])

  const _values = { ...values }
  if (_values.name === UNTITLED_NAME) {
    _values.name = ''
  }
  if (!_values.subtitle) {
    _values.subtitle = { textValue: '', ranges: [] }
  }

  return (
    <ValueListProvider onChange={onChange} values={_values}>
      <View pl="medium" pr="medium" pt="none" flexGrow={1} width="100%">
        <ValueListItem path="name">
          <TitleInput
            autoFocus
            readonly={readOnly}
            placeholder={UNTITLED_NAME}
            icon={
              <Icon>
                <GroupSvg />
              </Icon>
            }
          />
        </ValueListItem>
        {(_values.subtitle.textValue || !readOnly) && (
          <View
            borderVariant="thinLight"
            widthVariant="form"
            p="tiny"
            mt="tiny"
          >
            <ValueListItem path="subtitle">
              <TextInput
                variant="uiTextNormal"
                placeholder="Collection subtitle (optional)"
                readonly={readOnly}
              />
            </ValueListItem>
          </View>
        )}
        {_values.isImportedGroup && (
          <View flexDirection="row" alignItems="center" mt="small">
            <Text variant="uiTextSmall" color="text.3">
              Imported from:
            </Text>
            <Button
              variant="uiLink"
              textVariant="uiTextSmall"
              textColor="text.3"
              ml="tiny"
              href={makePublicUrl(_values)}
              target="_blank"
            >
              {makePublicUrl(_values)}
            </Button>
          </View>
        )}
        <View
          flexDirection="row"
          flexGrow={1}
          flexBasis="min-content"
          flexWrap="wrap"
        >
          <View
            widthVariant="form"
            flexShrink={1}
            flexGrow={1}
            mr="large"
            flexBasis="min-content"
            mb="small"
          >
            <GroupSection title="Pages" flexGrow={1} flexBasis="min-content">
              <Separator color="border.2" spacing="none" />
              <View flexGrow={1} flexBasis="min-content">
                <ValueListItem
                  path="pages"
                  pages={pages}
                  group={group}
                  dependencies={[groupValue.current.defaultPageId]}
                >
                  <PageDropzone
                    pages={pages}
                    group={group}
                    flexGrow={1}
                    defaultPageId={_values.defaultPageId}
                    readOnly={readOnly}
                    onSetDefaultPage={onSetDefaultPage}
                  />
                </ValueListItem>
              </View>
            </GroupSection>
          </View>
          <View
            flexShrink={1}
            flexGrow={1}
            flexBasis={1}
            overflow="hidden"
            widthVariant="form"
            minWidth={pxUnits(350)}
            height="100%"
          >
            {!readOnly && (
              <GroupSection title="Publishing">
                <PublicSharingSettings group={group} />
              </GroupSection>
            )}
          </View>
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

      <ScrollView p="medium" pt="large" flexGrow={1} flexShrink={1}>
        <GroupFields
          pages={pages}
          group={group}
          readOnly={isReadOnly || group.isImportedGroup}
          key={`${id}${isReadOnly}`}
        />
      </ScrollView>
    </>
  )
}
