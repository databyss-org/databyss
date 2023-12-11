import React from 'react'
import { Group } from '@databyss-org/services/interfaces'
import { useGroups } from '@databyss-org/data/pouchdb/hooks'
import { dbRef } from '@databyss-org/data/pouchdb/dbRef'
import ClickAwayListener from '../Util/ClickAwayListener'
import { DropdownContainer } from '../..'
import { DropdownList, MenuItem } from './DropdownList'
import FolderSvg from '../../assets/folder-open.svg'
import AddSvg from '../../assets/add-menu.svg'
import DatabyssSvg from '../../assets/logo-vector.svg'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('../../../databyss-desktop/src/eapi').default

export function DatabyssMenu({ onDismiss }: { onDismiss: () => void }) {
  const groupsRes = useGroups()

  const groups: Group[] = groupsRes.isSuccess
    ? Object.values(groupsRes.data)
    : []
  const sortedGroups = Object.values(groups)
    .filter(
      (group) => !!group.name && group.localGroup && group._id !== dbRef.groupId
    )
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
          top: 64,
          left: 35,
        }}
      >
        <DropdownList menuItems={menuItems} dismiss={onDismiss} />
      </DropdownContainer>
    </ClickAwayListener>
  )
}
