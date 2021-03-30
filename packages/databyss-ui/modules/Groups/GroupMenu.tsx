import React, { useState, useEffect, PropsWithChildren } from 'react'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { useEditorPageContext } from '@databyss-org/services'
import { BaseControl, Icon, View, ViewProps } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import ArchiveSvg from '@databyss-org/ui/assets/archive.svg'
import { getAccountFromLocation } from '@databyss-org/services/session/_helpers'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import LinkSvg from '@databyss-org/ui/assets/link.svg'
import TrashSvg from '@databyss-org/ui/assets/trash.svg'
import CheckSvg from '@databyss-org/ui/assets/check.svg'
import MenuSvg from '@databyss-org/ui/assets/menu_horizontal.svg'
// import { saveGroup } from '@databyss-org/services/groups'
// import { Group } from '@databyss-org/services/interfaces'
import DropdownContainer from '@databyss-org/ui/components/Menu/DropdownContainer'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import ClickAwayListener from '@databyss-org/ui/components/Util/ClickAwayListener'
import { menuLauncherSize } from '@databyss-org/ui/theming/buttons'
import { usePages, useGroups } from '@databyss-org/data/pouchdb/hooks'
import LoadingFallback from '../Notify/LoadingFallback'
import { deleteCollection } from '../../../databyss-data/pouchdb/groups/index'

interface GroupMenuProps extends ViewProps {
  groupId: string
}

const GroupMenu = ({ groupId }: PropsWithChildren<GroupMenuProps>) => {
  const { navigate } = useNavigationContext()

  const [showMenu, setShowMenu] = useState(false)

  //   const deletePage = useEditorPageContext((c) => c.deletePage)

  const handleEscKey = (e) => {
    if (e.key === 'Escape') {
      setShowMenu(false)
    }
  }

  const deleteGroup = async () => {
    // first remove the group from all associated documents

    await deleteCollection(groupId)
    navigate(`/`, { hasAccount: true })
    // window does not refresh on navigation change
    // window.location.reload()
  }

  const menuItems = [
    {
      icon: <TrashSvg />,
      label: 'Delete group forever',
      action: deleteGroup,
      actionType: 'delete-group',
    },
  ]

  const DropdownList = () =>
    menuItems.map((menuItem) => (
      <DropdownListItem
        {...menuItem}
        action={menuItem.actionType}
        onPress={() => menuItem.action()}
        key={menuItem.label}
      />
    ))

  return (
    <View
      position="relative"
      height={menuLauncherSize}
      width={menuLauncherSize}
      alignItems="center"
      justifyContent="center"
    >
      <BaseControl
        onPress={() => setShowMenu(!showMenu)}
        onKeyDown={handleEscKey}
        hoverColor="background.2"
        p="tiny"
        data-test-element="collection-dropdown"
      >
        <Icon sizeVariant="medium" color="text.1">
          <MenuSvg />
        </Icon>
      </BaseControl>
      {showMenu && (
        <ClickAwayListener onClickAway={() => setShowMenu(false)}>
          <DropdownContainer
            widthVariant="dropdownMenuMedium"
            open={showMenu}
            position={{
              top: menuLauncherSize + 8,
              right: 0,
            }}
          >
            <DropdownList />
          </DropdownContainer>
        </ClickAwayListener>
      )}
    </View>
  )
}

export default GroupMenu
