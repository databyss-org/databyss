import React, { useState } from 'react'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { BaseControl, Icon, View } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import ArchiveSvg from '@databyss-org/ui/assets/archive.svg'
import MenuSvg from '@databyss-org/ui/assets/menu_horizontal.svg'
import DropdownContainer from '@databyss-org/editor/components/DropdownContainer'
import DropdownListItem from '@databyss-org/editor/components/DropdownListItem'
import ClickAwayListener from '@databyss-org/ui/components/Util/ClickAwayListener'

export const ArchiveBin = ({ pages }) => {
  const { getSession } = useSessionContext()
  const { account } = getSession()
  const [showMenu, setShowMenu] = useState(false)

  const { getTokensFromPath, navigate } = useNavigationContext()

  const { id } = getTokensFromPath()

  const archivePage = usePageContext(c => c.archivePage)
  const setDefaultPage = usePageContext(c => c.setDefaultPage)

  const canBeArchived = Object.values(pages).filter(p => !p.archive).length > 1

  const onClick = () => {
    archivePage(id).then(() => {
      // if default page is archived set new page as default page
      let redirect = account.defaultPage
      if (account.defaultPage === id) {
        redirect = Object.keys(pages).find(_id => _id !== id)
        setDefaultPage(redirect)
      }
      navigate(`/pages/${redirect}`)
    })
  }

  const menuItems = [
    {
      icon: <ArchiveSvg />,
      label: 'Archive',
      shortcut: 'Ctrl + ⌫',
    },
  ]

  return canBeArchived ? (
    <View position="relative">
      <BaseControl
        onClick={() => setShowMenu(!showMenu)}
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
              top: 36,
              right: 0,
            }}
            py="extraSmall"
          >
            {menuItems.map(menuItem => (
              <DropdownListItem
                menuItem={menuItem}
                onClick={onClick}
                key={menuItem.label}
              />
            ))}
          </DropdownContainer>
        </ClickAwayListener>
      )}
    </View>
  ) : null
}
