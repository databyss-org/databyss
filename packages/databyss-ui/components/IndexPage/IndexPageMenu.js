import React, { useState } from 'react'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { View, Separator, BaseControl, Icon } from '@databyss-org/ui/primitives'
import MenuSvg from '@databyss-org/ui/assets/menu_horizontal.svg'
import HelpSvg from '@databyss-org/ui/assets/help.svg'
import SaveSvg from '@databyss-org/ui/assets/save.svg'
import DropdownContainer from '@databyss-org/ui/components/Menu/DropdownContainer'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import ClickAwayListener from '@databyss-org/ui/components/Util/ClickAwayListener'
import {
  downloadBibliography,
  downloadSourceMarkdown,
} from '@databyss-org/services/sources/lib'
import { menuLauncherSize } from '@databyss-org/ui/theming/buttons'
import { useBibliography } from '@databyss-org/data/pouchdb/hooks'
import { useNavigationContext } from '../Navigation/NavigationProvider'
import { useUserPreferencesContext } from '../../hooks'

const IndexPageMenu = ({ block }) => {
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)
  const { getTokensFromPath } = useNavigationContext()
  const [showMenu, setShowMenu] = useState(false)
  const path = getTokensFromPath()
  const { getPreferredCitationStyle } = useUserPreferencesContext()
  const biblioRes = useBibliography({
    formatOptions: {
      styleId: getPreferredCitationStyle(),
    },
  })

  const handleEscKey = (e) => {
    if (e.key === 'Escape') {
      setShowMenu(false)
    }
  }

  const exportBibliography = async (path) => {
    if (!path.params) {
      // bibliography (full or filtered by author)
      await downloadBibliography({
        items: Object.values(biblioRes.data),
        author: path.author,
        styleId: getPreferredCitationStyle(),
      })
    } else {
      // export single source
      await downloadSourceMarkdown({
        source: block,
        styleId: getPreferredCitationStyle(),
      })
    }
  }

  const menuItems = []
  if (path.type === 'sources') {
    menuItems.push({
      icon: <SaveSvg />,
      label: 'Export Bibliography',
      subLabel: 'Download as Markdown',
      action: () => exportBibliography(path),
      actionType: 'exportBiblio',
    })
  }

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

  const DropdownList = () =>
    menuItems.map(({ separator, ...menuItem }, idx) =>
      separator ? (
        <Separator {...menuItem} key={idx} />
      ) : (
        <DropdownListItem
          {...menuItem}
          action={menuItem.actionType}
          onPress={() => {
            if (menuItem.action) {
              menuItem.action()
            }
            if (menuItem.hideMenu) {
              setShowMenu(false)
            }
          }}
          key={menuItem.label}
        />
      )
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
        onPress={() => setShowMenu(!showMenu)}
        onKeyDown={handleEscKey}
        hoverColor="background.2"
        p="tiny"
        data-test-element="archive-dropdown"
        label="Archive Page"
      >
        {!isPublicAccount() && (
          <Icon sizeVariant="medium" color="text.1">
            <MenuSvg />
          </Icon>
        )}
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

export default IndexPageMenu
