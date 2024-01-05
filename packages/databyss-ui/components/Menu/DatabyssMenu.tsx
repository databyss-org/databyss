import React, { useState } from 'react'
import { dbRef } from '@databyss-org/data/pouchdb/dbRef'
import { Group } from '@databyss-org/services/interfaces'
import { useGroups } from '@databyss-org/data/pouchdb/hooks'
import { useAppState } from '../../../databyss-desktop/src/hooks'
import ClickAwayListener from '../Util/ClickAwayListener'
import { DropdownContainer, View, Icon } from '../..'
import { DropdownList, makeDropdownListChildren, MenuItem } from './DropdownList'
import FolderSvg from '../../assets/folder-open.svg'
import AddSvg from '../../assets/add-menu.svg'
import DatabyssSvg from '../../assets/logo-vector.svg'
import DiskSvg from '../../assets/save.svg'
import CheckSvg from '../../assets/check.svg'
import LoadingFallback from '../Notify/LoadingFallback'
import { theme } from '../../theming'
import MenuSvg from '../../assets/menu_horizontal.svg'
import { useNotifyContext } from '../Notify/NotifyProvider'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('../../../databyss-desktop/src/eapi').default

export function DatabyssMenu({ onDismiss }: { onDismiss?: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  return (
    <>
      {isLoading && (
        <View
          position="absolute"
          left={0}
          right={0}
          top={0}
          bottom={0}
          zIndex={theme.zIndex.modal + 1}
        >
          <View
            position="absolute"
            left={0}
            right={0}
            top={0}
            bottom={0}
            opacity={0.8}
            bg="gray.5"
          />
          <LoadingFallback zIndex={theme.zIndex.modal + 2} />
        </View>
      )}
      <ClickAwayListener onClickAway={onDismiss}>
        <DropdownContainer
          minWidth={250}
          open
          position={{
            top: 35,
            right: 25,
          }}
        >
          <DatabyssMenuItems
            onDismiss={onDismiss}
            onLoading={(group) => {
              setIsLoading(!!group)
            }}
          />
        </DropdownContainer>
      </ClickAwayListener>
    </>
  )
}

export function DatabyssMenuItems({
  onDismiss,
  onLoading,
}: {
  onDismiss?: () => void
  onLoading?: (group?: Group | boolean) => void
}) {
  const localGroupsRes = useAppState('localGroups')
  const dataPath = useAppState('dataPath')
  const groupsRes = useGroups()
  const notifyConfirm = useNotifyContext(c => c && c.notifyConfirm)
  const notify = useNotifyContext(c => c && c.notify)

  const groups: Group[] = localGroupsRes.isSuccess
    ? localGroupsRes.data.map(
        (localGroup) => groupsRes.data?.[localGroup._id] ?? localGroup
      ) // .filter((g) => !!g)
    : []
  const sortedGroups = Object.values(groups)
    // .filter((group) => group._id !== dbRef.groupId)
    .sort((a, b) => (a.name < b.name ? -1 : 1))

  // console.log('[DatabyssMenu] localGroups', sortedGroups)

  const dbContextMenuItems: MenuItem[] = [
    {
      label: 'Archive Databyss',
      action: (group: Group) => {
        notifyConfirm({
          message: `Are you sure you want to archive and remove "${group.name}"? Data will be backed up to a JSON file and the Databyss will be removed from the list.`,
          onOk: async () => {
            console.log('[DatabyssMenu] delete', group.name)
            const _archivePath = await eapi.file.archiveDatabyss(group._id)
            notify({
              message: `Databyss archived to: ${_archivePath}`
            })
          }
        })
      }
    }
  ]

  const menuItems: MenuItem[] = [
    ...(sortedGroups.length > 0
      ? [
          {
            label: 'Open Existing Databyss',
            separator: true,
          },
        ]
      : []),
    ...sortedGroups.map((group) => ({
      label: group.name,
      subMenu: dbContextMenuItems,
      subMenuProps: {
        data: group,
        menuViewProps: {
          right: 0,
          theme,
        },
        menuIcon: <Icon sizeVariant="tiny" color="white"><MenuSvg /></Icon>,
      },
      icon: group._id === dbRef.groupId ? <CheckSvg /> : <DatabyssSvg />,
      action: () => {
        if (group._id !== dbRef.groupId) {
          eapi.db.loadGroup(group._id)
        }
        return true
      },
    })),
    {
      label: 'Add a Databyss',
      separator: true,
    },
    {
      label: 'Import from a file...',
      icon: <FolderSvg />,
      action: async () => {
        if (onLoading) {
          // console.log('[DatabyssMenu] onLoading')
          onLoading(true)
        }
        const _importing = await eapi.file.importDatabyss()
        if (!_importing) {
          if (onLoading) {
            onLoading(false)
          }
          return false
        }
        return true
      },
    },
    {
      label: 'Create new Databyss',
      icon: <AddSvg />,
      action: async () => {
        await eapi.file.newDatabyss()
        return true
      },
    },
  ]

  if (!dbRef.groupId) {
    menuItems.push(
      {
        label: 'Data settings',
        separator: true,
      },
      {
        icon: <DiskSvg />,
        label: 'Set data directory...',
        subLabel: dataPath.data ?? '',
        action: async () => {
          await eapi.file.chooseDataPath()
          return true
        },
      }
    )
  }

  return <DropdownList menuItems={menuItems} dismiss={onDismiss} />
}
