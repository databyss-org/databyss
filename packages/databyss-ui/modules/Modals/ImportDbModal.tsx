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
  Separator,
  Text,
  View,
} from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { LoadingFallback } from '@databyss-org/ui/components'
import { useAppState } from '@databyss-org/desktop/src/hooks'
import { Group } from '@databyss-org/services/interfaces'
import CloseSvg from '@databyss-org/ui/assets/close.svg'
import { DropdownMenu } from '../../components/Menu/DropdownMenu'
import { MenuItem } from '../../components/Menu/DropdownList'
import { FileInput } from '../../components/Form/FileInput'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('@databyss-org/desktop/src/eapi').default

export interface ImportDbOptions {
  mergeIntoGroup: Group | null
  files: FileList | null
}

export const ImportDbModal = ({
  visible,
  onImport,
  onCancel,
}: {
  visible: boolean
  onImport?: () => void
  onCancel?: () => void
}) => {
  const [values, setValues] = useState<ImportDbOptions>({
    mergeIntoGroup: null,
    files: null,
  })
  const { hideModal } = useNavigationContext()
  const localGroupsRes = useAppState('localGroups')

  console.log('[ImportDbModal] values', values)

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
    await eapi.file.importDatabyss(
      values.files![0]!.path,
      values.mergeIntoGroup?._id
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
        value: _group,
      }))
    )
  }

  const _confirmButtonsView = (
    <>
      <View flexDirection="row" justifyContent="flex-end" px="em">
        <Button variant="uiTextButton" mr="small" onPress={onDismiss}>
          Cancel
        </Button>
        <Button
          variant="primaryUiSmall"
          onPress={onSubmit}
          disabled={!values.files?.[0]?.path}
        >
          Import
        </Button>
      </View>
    </>
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
          <FileInput buttonVariant="secondaryUiSmall" />
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
              renderLabel={(_group) => (_group ? _group.name : 'New Databyss')}
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
              {_openFileView}
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
