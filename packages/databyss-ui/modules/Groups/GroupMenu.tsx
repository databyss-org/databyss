import React, { useState, PropsWithChildren } from 'react'
import { BaseControl, Icon, View, ViewProps } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import TrashSvg from '@databyss-org/ui/assets/trash.svg'
import MenuSvg from '@databyss-org/ui/assets/menu_horizontal.svg'
// import DropdownContainer from '@databyss-org/ui/components/Menu/DropdownContainer'
// import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import ClickAwayListener from '@databyss-org/ui/components/Util/ClickAwayListener'
import { menuLauncherSize } from '@databyss-org/ui/theming/buttons'
import { deleteCollection } from '@databyss-org/data/pouchdb/groups/index'
import {
  DropdownListItem,
  DropdownContainer,
} from '@databyss-org/ui/components'
import { useGroups } from '@databyss-org/data/pouchdb/hooks'

interface GroupMenuProps extends ViewProps {
  groupId: string
}

const GroupMenu = ({ groupId }: PropsWithChildren<GroupMenuProps>) => {
  const { navigate } = useNavigationContext()
  const groupsRes = useGroups()

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
    setShowMenu(false)
    // navigate to next named group, if there is one
    const _namedGroups = Object.values(groupsRes.data!).filter(
      (group) => !!group.name
    )
    for (const group of _namedGroups) {
      if (group._id !== groupId) {
        navigate(`/collections/${group._id}`)
        return
      }
    }
    navigate(`/`, { hasAccount: true })
    // window does not refresh on navigation change
    // setTimeout(() => window.location.reload(), 50)
  }

  const DropdownList = () => (
    <DropdownListItem
      icon={<TrashSvg />}
      label="Delete collection"
      data-test-element="delete-group"
      action="delete-group"
      onPress={deleteGroup}
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
