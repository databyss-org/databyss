import React, { useState } from 'react'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { BaseControl, Icon, View } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import ArchiveSvg from '@databyss-org/ui/assets/archive.svg'
import MenuSvg from '@databyss-org/ui/assets/menu_horizontal.svg'
import DropdownContainer from '@databyss-org/ui/components/Menu/DropdownContainer'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import ClickAwayListener from '@databyss-org/ui/components/Util/ClickAwayListener'
import { menuLauncherSize } from '@databyss-org/ui/theming/buttons'

export const ArchiveBin = ({ pages }) => {
  const { getSession } = useSessionContext()
  const { account } = getSession()
  const [showMenu, setShowMenu] = useState(false)

  const { getTokensFromPath, navigate } = useNavigationContext()

  const { id } = getTokensFromPath()

  const archivePage = usePageContext(c => c.archivePage)
  const setDefaultPage = usePageContext(c => c.setDefaultPage)

  const canBeArchived = Object.values(pages).filter(p => !p.archive).length > 1

  const onPress = () => {
    let redirect = account.defaultPage
    // if default page is archived set new page as default page
    if (account.defaultPage === id) {
      const _pages = pages
      delete _pages[id]
      redirect = Object.keys(_pages)[0]
      setDefaultPage(redirect)
    }
    navigate(`/pages/${redirect}`)
    setTimeout(() => archivePage(id), 50)
  }

  const menuItems = [
    {
      icon: <ArchiveSvg />,
      label: 'Archive',
      shortcut: 'Ctrl + Del',
    },
  ]

  return canBeArchived ? (
    <View
      position="relative"
      height={menuLauncherSize}
      width={menuLauncherSize}
      alignItems="center"
      justifyContent="center"
    >
      <BaseControl
        onPress={() => setShowMenu(!showMenu)}
        hoverColor="background.2"
        p="tiny"
        label="Archive Page"
      >
        <Icon sizeVariant="medium" color="text.1">
          <MenuSvg />
        </Icon>
      </BaseControl>
      {showMenu && (
        <ClickAwayListener onClickAway={() => setShowMenu(false)}>
          <DropdownContainer
            open={showMenu}
            position={{
              top: menuLauncherSize + 8,
              right: 0,
            }}
          >
            {menuItems.map(menuItem => (
              <DropdownListItem
                menuItem={menuItem}
                onPress={onPress}
                key={menuItem.label}
              />
            ))}
          </DropdownContainer>
        </ClickAwayListener>
      )}
    </View>
  ) : null
}
