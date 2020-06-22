import React, { useState } from 'react'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { BaseControl, Icon, View, Text } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import ArchiveSvg from '@databyss-org/ui/assets/archive.svg'
import MenuSvg from '@databyss-org/ui/assets/menu_horizontal.svg'
import DropdownMenu from '@databyss-org/editor/components/DropdownMenu'

export const ArchiveBin = ({ pages }) => {
  const { getSession } = useSessionContext()
  const { account } = getSession()
  const [showMenu, setShowMenu] = useState(false)

  const { getTokensFromPath, navigate } = useNavigationContext()

  const { id } = getTokensFromPath()

  const { archivePage, setDefaultPage } = usePageContext()

  const canBeArchived = Object.keys(pages).length > 1

  const onClick = () => {
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
      title: 'Archive Page',
      shortcut: '⌘ + Del',
    },
  ]

  return canBeArchived ? (
    <View position="relative">
      <BaseControl
        onClick={() => setShowMenu(!showMenu)}
        hoverColor="background.2"
        p="tiny"
        title="Archive Page"
      >
        <Icon sizeVariant="medium" color="text.1">
          <MenuSvg />
        </Icon>
      </BaseControl>
      {showMenu && (
        <DropdownMenu
          open={showMenu}
          position={{
            top: 36,
            right: 0,
          }}
        >
          {menuItems.map(menuItem => (
            <BaseControl
              onClick={onClick}
              hoverColor="background.1"
              p="small"
              title={menuItem.title}
              key={menuItem.title}
              childViewProps={{ flexDirection: 'row' }}
            >
              <Icon sizeVariant="small" color="text.1" mr="small">
                {menuItem.icon}
              </Icon>
              <Text variant="uiTextSmall">{menuItem.title}</Text>
            </BaseControl>
          ))}
        </DropdownMenu>
      )}
    </View>
  ) : null
}
