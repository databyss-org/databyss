import React, { useState, PropsWithChildren } from 'react'
import { BaseControl, Icon, View, ViewProps } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import TrashSvg from '@databyss-org/ui/assets/trash.svg'
import MenuSvg from '@databyss-org/ui/assets/menu_horizontal.svg'
// import DropdownContainer from '@databyss-org/ui/components/Menu/DropdownContainer'
// import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import ClickAwayListener from '@databyss-org/ui/components/Util/ClickAwayListener'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { menuLauncherSize } from '@databyss-org/ui/theming/buttons'
import {
  DropdownListItem,
  DropdownContainer,
} from '@databyss-org/ui/components'
import { useGroups } from '@databyss-org/data/pouchdb/hooks'
import { useExportContext } from '@databyss-org/services/export'
import { useDatabaseContext } from '@databyss-org/services/lib/DatabaseProvider'
import { dbRef } from '@databyss-org/data/pouchdb/dbRef'

interface GroupMenuProps extends ViewProps {
  groupId: string
}

const GroupMenu = ({ groupId }: PropsWithChildren<GroupMenuProps>) => {
  const { navigate } = useNavigationContext()
  const isReadOnly = useSessionContext((c) => c && c.isReadOnly)
  const unpublishGroupDatabase = useExportContext(
    (c) => c && c.unpublishGroupDatabase
  )
  const removeGroup = useDatabaseContext((c) => c && c.removeGroup)

  const groupsRes = useGroups()

  const [showMenu, setShowMenu] = useState(false)

  //   const deletePage = useEditorPageContext((c) => c.deletePage)

  const handleEscKey = (e) => {
    if (e.key === 'Escape') {
      setShowMenu(false)
    }
  }

  const deleteGroup = async () => {
    if (!groupsRes.data) {
      return
    }
    // first remove the group from all associated documents
    const _group = groupsRes.data[groupId]
    await removeGroup(_group)
    if (_group.public) {
      await unpublishGroupDatabase(_group)
    }
    // navigate to next named group, if there is one
    const _nextGroup = Object.values(groupsRes.data!).find(
      (_group) =>
        !!_group.name && _group._id !== groupId && _group._id !== dbRef.groupId
    )
    if (_nextGroup) {
      setTimeout(
        () => navigate(`/collections/${_nextGroup._id}`, { replace: true }),
        50
      )
      return
    }
    setTimeout(() => navigate('/', { replace: true }), 50)
    setShowMenu(false)
  }

  const DropdownList = () => (
    <DropdownListItem
      icon={<TrashSvg />}
      label="Delete collection"
      data-test-element="delete-group"
      action="delete-group"
      onPress={deleteGroup}
      disabled={isReadOnly}
    />
  )

  return (
    <View
      position="relative"
      height={menuLauncherSize}
      width={menuLauncherSize}
      alignItems="center"
      justifyContent="center"
    >
      <BaseControl
        data-test-element="group-menu"
        onPress={() => setShowMenu(!showMenu)}
        onKeyDown={handleEscKey}
        hoverColor="background.2"
        p="tiny"
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
            children={<DropdownList />}
          />
        </ClickAwayListener>
      )}
    </View>
  )
}

export default GroupMenu
