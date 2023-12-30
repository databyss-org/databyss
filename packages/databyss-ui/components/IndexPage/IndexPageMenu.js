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
import { addMenuFooterItems, exportMenuItems } from '../PageContent/PageMenu'

const IndexPageMenu = ({ block }) => {
  const { getTokensFromPath } = useNavigationContext()
  const [showMenu, setShowMenu] = useState(false)
  const path = getTokensFromPath()
  const exportContext = useExportContext()

  const handleEscKey = (e) => {
    if (e.key === 'Escape') {
      setShowMenu(false)
    }
  }

  const menuItems = []
  
  menuItems.push(
    ...exportMenuItems(
      exportContext,
      path.type === 'sources'
        ? [
            {
              icon: <SaveSvg />,
              label: path.params ? 'Export Citation' : 'Export Bibliography',
              action: () =>
                exportContext.exportBibliography({
                  source: block,
                  author: path.author,
                }),
              actionType: 'exportBiblio',
            },
          ]
        : []
    )
  )

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
        hoverColor="background.1"
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
