import React from 'react'
import { dbRef } from '@databyss-org/data/pouchdb/dbRef'
import { Group } from '@databyss-org/services/interfaces'
import { useAppState } from '../../../databyss-desktop/src/hooks'
import ClickAwayListener from '../Util/ClickAwayListener'
import { DropdownContainer } from '../..'
import { DropdownList, MenuItem } from './DropdownList'
import FolderSvg from '../../assets/folder-open.svg'
import AddSvg from '../../assets/add-menu.svg'
import DatabyssSvg from '../../assets/logo-vector.svg'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('../../../databyss-desktop/src/eapi').default

export function DatabyssMenu({ onDismiss }: { onDismiss: () => void }) {
  const groupsRes = useAppState('localGroups')

  const groups: Group[] = groupsRes.isSuccess
    ? Object.values(groupsRes.data)
    : []
  const sortedGroups = Object.values(groups)
    .filter((group) => group._id !== dbRef.groupId)
    .sort((a, b) => (a.name < b.name ? -1 : 1))

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
      icon: <DatabyssSvg />,
      action: () => {
        console.log('[DatabyssMenu] load group', group._id)
        eapi.db.loadGroup(group._id)
        return true
      },
    })),
    {
      label: 'Add a Databyss',
      separator: true,
    },
    {
      label: 'From a file...',
      icon: <FolderSvg />,
      action: () => {
        eapi.file.importDatabyss()
        return true
      },
    },
    {
      label: 'Create new Databyss',
      icon: <AddSvg />,
    },
  ]

  return (
    <ClickAwayListener onClickAway={onDismiss}>
      <DropdownContainer
        minWidth={250}
        open
        position={{
          top: 35,
          right: 25,
        }}
      >
        <DropdownList menuItems={menuItems} dismiss={onDismiss} />
      </DropdownContainer>
    </ClickAwayListener>
  )
}
