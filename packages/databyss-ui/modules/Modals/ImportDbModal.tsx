import React, { useState } from 'react'
// import { setTopic } from '@databyss-org/services/topics'
import ValueListProvider, {
  ValueListItem,
} from '@databyss-org/ui/components/ValueList/ValueListProvider'
import {
  BaseControl,
  Button,
  Icon,
  List,
  ModalWindow,
  Text,
  View,
} from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { LoadingFallback } from '@databyss-org/ui/components'
import { useAppState } from '@databyss-org/desktop/src/hooks'
import { useRemoteDbInfo } from '@databyss-org/services/lib/DatabaseProvider'
import { dbRef } from '@databyss-org/data/pouchdb/dbRef'
import CloseSvg from '@databyss-org/ui/assets/close.svg'
import { DropdownMenu } from '../../components/Menu/DropdownMenu'
import { MenuItem } from '../../components/Menu/DropdownList'
import { FileInput } from '../../components/Form/FileInput'
import { pxUnits } from '../../theming/views'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('@databyss-org/desktop/src/eapi').default

export interface ImportDbOptions {
  mergeIntoGroup: string | null
  files: FileList | null
}

export const ImportDbModal = ({
  visible,
  onImport,
  onCancel,
  groupId,
}: {
  visible: boolean
  onImport?: () => void
  onCancel?: () => void
  groupId?: string
}) => {
  const [values, setValues] = useState<ImportDbOptions>({
    mergeIntoGroup: dbRef.groupId,
    files: null,
  })
  const [importing, setImporting] = useState<boolean>(false)
  const { hideModal } = useNavigationContext()
  const localGroupsRes = useAppState('localGroups')
  const remoteDbInfoRes = useRemoteDbInfo(groupId)

  // console.log('[ImportDbModal] values', values)

  const onDismiss = () => {
    if (onCancel) {
      onCancel()
    }
    hideModal()
  }

  const onClearFiles = () => {
    setValues({
      ...values,
      files: null,
    })
  }

  const onSubmit = async () => {
    setImporting(true)
    await eapi.file.importDatabyss(
      values.files?.[0]?.path,
      values.mergeIntoGroup,
      groupId
    )
    if (onImport) {
      onImport()
    }
    hideModal()
  }

  let _localGroupMenuItems: MenuItem[] = [
    {
      label: '[New Databyss]',
      value: null,
    },
  ]
  if (localGroupsRes.data) {
    _localGroupMenuItems = _localGroupMenuItems.concat(
      localGroupsRes.data.map((_group) => ({
        label: _group.name,
        value: _group._id,
      }))
    )
  }

  const _confirmButtonsView = (
    <View flexDirection="row" justifyContent="space-between" px="em">
      <View flexDirection="row" alignItems="center">
        {importing && (
          <>
            <LoadingFallback />
            <Text variant="uiTextNormal" color="text.3" ml="tiny">
              Importing data…
            </Text>
          </>
        )}
      </View>
      <View flexDirection="row" justifyContent="flex-end">
        <Button variant="uiTextButton" mr="small" onPress={onDismiss}>
          Cancel
        </Button>
        {!importing && (
          <Button
            variant="primaryUiSmall"
            onPress={onSubmit}
            disabled={
              !(
                (groupId && remoteDbInfoRes.isSuccess) ||
                values.files?.[0]?.path
              )
            }
          >
            Import
          </Button>
        )}
      </View>
    </View>
  )

  const _remoteDbView = (
    <View>
      <Text variant="uiTextNormal" color="text.3">
        Import from published collection:
      </Text>
      {!!remoteDbInfoRes.data && (
        <Button
          mt="small"
          pr={pxUnits(19)}
          variant="uiLink"
          textVariant="uiTextNormal"
          textColor="text.2"
          href={`${process.env.PUBLISHED_URL}/${groupId}`}
          target="_blank"
          title={`${process.env.PUBLISHED_URL}/${groupId}`}
          flexDirection="row"
          justifyContent="flex-end"
          alignSelf="flex-end"
        >
          {remoteDbInfoRes.data.name}
        </Button>
      )}
    </View>
  )

  const _openFileView = (
    <View
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
    >
      <View
        flexDirection="row"
        alignItems="center"
        flexShrink={1}
        overflow="hidden"
        pr="small"
      >
        <Text
          variant="uiTextNormal"
          css={{ whiteSpace: 'nowrap' }}
          color="text.3"
        >
          From file
        </Text>
        <View flexShrink={1} overflow="hidden" pl="medium">
          <Text
            variant="uiTextNormal"
            color="text.2"
            css={{
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            overflow="hidden"
          >
            {values.files?.[0]?.name}
          </Text>
        </View>
      </View>
      {!values.files?.[0]?.name ? (
        <ValueListItem path="files">
          <FileInput buttonVariant="secondaryUiSmall" accept=".zip" />
        </ValueListItem>
      ) : (
        <View mr="small" my="small" flexShrink={1}>
          <BaseControl onClick={onClearFiles}>
            <Icon sizeVariant="tiny" color="text.3">
              <CloseSvg />
            </Icon>
          </BaseControl>
        </View>
      )}
    </View>
  )

  const _importIntoView = (
    <View flexDirection="row" alignItems="center">
      <Text variant="uiTextNormal" color="text.3">
        Import into
      </Text>
      <View flexGrow={1} flexShrink={1} overflow="hidden">
        <View
          alignSelf="flex-end"
          justifyContent="right"
          flexDirection="row"
          alignItems="center"
          maxWidth="80%"
        >
          <ValueListItem path="mergeIntoGroup">
            <DropdownMenu
              renderLabel={(_groupId) =>
                _groupId
                  ? localGroupsRes.data?.find((_id) => _id === _groupId)?.name
                  : '[New Databyss]'
              }
              menuItems={_localGroupMenuItems}
              // width="100%"
              menuViewProps={{ justifyContent: 'right' }}
              showFilter
              ellipsis
            />
          </ValueListItem>
        </View>
      </View>
    </View>
  )

  return (
    <ModalWindow
      visible={visible}
      widthVariant="dialog"
      onDismiss={onDismiss}
      title="Import Databyss"
      // dismissChild="done"
      canDismiss
      px="none"
      pt="none"
    >
      {localGroupsRes.isSuccess ? (
        <ValueListProvider onChange={setValues} values={values}>
          <View
            paddingVariant="none"
            backgroundColor="background.0"
            width="100%"
          >
            <List horizontalItemPadding="em" verticalItemPadding="small">
              {groupId ? _remoteDbView : _openFileView}
              {_importIntoView}
            </List>
            {_confirmButtonsView}
          </View>
        </ValueListProvider>
      ) : (
        <LoadingFallback queryObserver={localGroupsRes} />
      )}
    </ModalWindow>
  )
}
