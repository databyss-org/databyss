import React, { useState } from 'react'
import {
  Text,
  BaseControl,
  View,
  Separator,
  pxUnits,
} from '@databyss-org/ui/primitives'
import LinkSvg from '@databyss-org/ui/assets/link.svg'
import LogoutSvg from '@databyss-org/ui/assets/log-out.svg'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import ClickAwayListener from '@databyss-org/ui/components/Util/ClickAwayListener'
import { getAuthToken } from '@databyss-org/services/session/clientStorage'
import DropdownContainer from '../Menu/DropdownContainer'
import DropdownListItem from '../Menu/DropdownListItem'
import { AccountLoader } from '../Loaders'

const AccountMenu = () => {
  const { navigate } = useNavigationContext()
  const { isPublicAccount, logout } = useSessionContext()
  const [menuOpen, setMenuOpen] = useState(false)

  const navToDefaultPage = userInfo => {
    navigate(`/${userInfo.defaultAccount}/pages/${userInfo.defaultPage}`, {
      hasAccount: true,
    })
    // window does not refresh on navigation change
    window.location.reload()
  }

  const onLogout = () => {
    logout()
    window.requestAnimationFrame(() => (window.location.href = '/'))
  }

  return getAuthToken() ? (
    <AccountLoader>
      {userInfo => {
        const menuItems = [
          {
            icon: <LogoutSvg />,
            label: 'Sign out',
            action: () => onLogout(),
            actionType: 'logout',
          },
        ]

        if (isPublicAccount()) {
          menuItems.unshift({
            icon: <LinkSvg />,
            label: 'Back to my Databyss',
            action: () => navToDefaultPage(userInfo),
            actionType: 'backToDatabyss',
          })
        }

        const DropdownList = () =>
          menuItems.map((menuItem, i) => (
            <View key={`${menuItem.label}-account-${i}`}>
              <DropdownListItem
                {...menuItem}
                action={menuItem.actionType}
                onPress={menuItem.action}
              />
              {menuItems.length !== i + 1 && (
                <Separator color="border.3" spacing="extraSmall" />
              )}
            </View>
          ))

        return (
          <View pl="em" my="extraSmall" position="relative">
            <BaseControl onClick={() => setMenuOpen(true)}>
              <View
                borderVariant="round"
                borderRadius="50%"
                backgroundColor="blue.0"
                width={20}
                height={20}
                alignItems="center"
                justifyContent="center"
              >
                <Text variant="uiText" color="text.6">
                  {userInfo.email[0].toUpperCase()}
                </Text>
              </View>
            </BaseControl>

            {menuOpen && (
              <ClickAwayListener onClickAway={() => setMenuOpen(false)}>
                <DropdownContainer
                  widthVariant="dropdownMenuMedium"
                  open={menuOpen}
                  mt={pxUnits(34)}
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
                      {userInfo.email}
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
      }}
    </AccountLoader>
  ) : null
}

export default AccountMenu
