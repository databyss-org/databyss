import React, { useState } from 'react'
import {
  Text,
  BaseControl,
  Grid,
  View,
  Separator,
  pxUnits,
} from '@databyss-org/ui/primitives'
import theme from '@databyss-org/ui/theming/theme'
import LinkSvg from '@databyss-org/ui/assets/link.svg'
import LogoutSvg from '@databyss-org/ui/assets/log-out.svg'
import { ThemeProvider } from 'emotion-theming'
import ClickAwayListener from '@databyss-org/ui/components/Util/ClickAwayListener'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import DropdownContainer from '../Menu/DropdownContainer'
import DropdownListItem from '../Menu/DropdownListItem'

const AccountMenu = () => {
  const { isPublicAccount } = useSessionContext()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuItems = [
    {
      icon: <LinkSvg />,
      label: 'Back to my Databyss',
      action: () => console.log('pressed'),
      actionType: 'backToDatabyss',
    },
    {
      icon: <LogoutSvg />,
      label: 'Sign out',
      action: () => console.log('pressed'),
      actionType: 'logout',
    },
  ]

  const DropdownList = () =>
    menuItems.map((menuItem, i) => (
      <View key={`${menuItem.label}-account-${i}`}>
        <DropdownListItem
          {...menuItem}
          action={menuItem.actionType}
          onPress={() => menuItem.action()}
        />
        {menuItems.length !== i + 1 && (
          <Separator color="border.3" spacing="extraSmall" />
        )}
      </View>
    ))

  return (
    <View pl="em" mb="extraSmall" position="relative">
      <BaseControl onClick={() => setMenuOpen(true)}>
        <View
          borderVariant="round"
          borderRadius="50%"
          backgroundColor="blue.2"
          width={32}
          height={32}
          alignItems="center"
          justifyContent="center"
        >
          <Text variant="heading4" color="text.6">
            J
          </Text>
        </View>
      </BaseControl>

      {menuOpen && (
        <ClickAwayListener onClickAway={() => setMenuOpen(false)}>
          <DropdownContainer
            widthVariant="dropdownMenuMedium"
            open={menuOpen}
            mt={pxUnits(42)}
            position={{
              top: 0,
              right: 0,
            }}
          >
            <View
              ml="small"
              height={pxUnits(34)}
              justifyContent="center"
              key="account-name"
            >
              <Text color="text.2" variant="uiTextSmall">
                email@email.com
              </Text>
            </View>
            <Separator
              key="account-name-seperator"
              color="border.3"
              spacing="extraSmall"
            />
            <DropdownList />
          </DropdownContainer>
        </ClickAwayListener>
      )}
    </View>
  )
}

export default AccountMenu
