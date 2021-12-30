import React, { useState } from 'react'
import { View, BaseControl, Icon } from '@databyss-org/ui/primitives'
import MenuSvg from '@databyss-org/ui/assets/menu_horizontal.svg'
import HelpSvg from '@databyss-org/ui/assets/help.svg'
import SaveSvg from '@databyss-org/ui/assets/save.svg'
import ExportAllSvg from '@databyss-org/ui/assets/export-all.svg'
import DropdownContainer from '@databyss-org/ui/components/Menu/DropdownContainer'
import { DropdownList } from '@databyss-org/ui/components'
import ClickAwayListener from '@databyss-org/ui/components/Util/ClickAwayListener'
import { menuLauncherSize } from '@databyss-org/ui/theming/buttons'
import { useExportContext } from '@databyss-org/services/export'
import { useNavigationContext } from '../Navigation/NavigationProvider'

const IndexPageMenu = ({ block }) => {
  const { getTokensFromPath } = useNavigationContext()
  const [showMenu, setShowMenu] = useState(false)
  const path = getTokensFromPath()
  const { exportBibliography, exportAllPages } = useExportContext()

  const handleEscKey = (e) => {
    if (e.key === 'Escape') {
      setShowMenu(false)
    }
  }

  const menuItems = []
  menuItems.push({
    separator: true,
    label: 'Export Markdown',
  })

  if (path.type === 'sources') {
    menuItems.push({
      icon: <SaveSvg />,
      label: path.params ? 'Export Citation' : 'Export Bibliography',
      action: () => exportBibliography({ source: block, author: path.author }),
      actionType: 'exportBiblio',
    })
  }

  menuItems.push({
    icon: <ExportAllSvg />,
    label: 'Export everything',
    subLabel: 'Download all pages and references',
    action: () => {
      setShowMenu(false)
      exportAllPages()
    },
    actionType: 'exportAll',
    hideMenu: true,
  })

  if (menuItems.length > 0) {
    menuItems.push({ separator: true })
  }

  menuItems.push({
    icon: <HelpSvg />,
    label: 'Help...',
    href: '/g_7v9n4vjx2h7511',
    target: '_blank',
    actionType: 'help',
    light: true,
  })

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
