import React, { useState } from 'react'
import { View, BaseControl, Icon } from '@databyss-org/ui/primitives'
import MenuSvg from '@databyss-org/ui/assets/menu_horizontal.svg'
import ShareSvg from '@databyss-org/ui/assets/share.svg'
import DropdownContainer from '@databyss-org/ui/components/Menu/DropdownContainer'
import { DropdownList } from '@databyss-org/ui/components'
import ClickAwayListener from '@databyss-org/ui/components/Util/ClickAwayListener'
import { menuLauncherSize } from '@databyss-org/ui/theming/buttons'
import { useNavigationContext } from '../Navigation/NavigationProvider'
import { addMenuFooterItems } from '../PageContent/PageMenu'

const IndexPageMenu = () => {
  const { showModal } = useNavigationContext()
  const [showMenu, setShowMenu] = useState(false)

  const handleEscKey = (e) => {
    if (e.key === 'Escape') {
      setShowMenu(false)
    }
  }

  const menuItems = []

  menuItems.push({
    icon: <ShareSvg />,
    label: 'Export...',
    action: () =>
      showModal({
        component: 'EXPORTDB',
        visible: true,
      }),
    actionType: 'export',
  })

  addMenuFooterItems(menuItems)

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
        data-test-element="archive-dropdown"
        label="Archive Page"
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
            <DropdownList menuItems={menuItems} />
          </DropdownContainer>
        </ClickAwayListener>
      )}
    </View>
  )
}

export default IndexPageMenu
