import React, { useState, useEffect } from 'react'
import { Text, BaseControl, View, Separator } from '@databyss-org/ui/primitives'
import LinkSvg from '@databyss-org/ui/assets/link.svg'
import LogoutSvg from '@databyss-org/ui/assets/log-out.svg'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import ClickAwayListener from '@databyss-org/ui/components/Util/ClickAwayListener'
import { getAuthToken } from '@databyss-org/services/session/clientStorage'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'
import { version } from '@databyss-org/services'
import DropdownContainer from '../Menu/DropdownContainer'
import DropdownListItem from '../Menu/DropdownListItem'
import { AccountLoader } from '../Loaders'

const AccountMenu = () => {
  const { navigate } = useNavigationContext()
  const { isOnline, notifyConfirm } = useNotifyContext()
  const logout = useSessionContext((c) => c && c.logout)
  const isDbBusy = useSessionContext((c) => c && c.isDbBusy)
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)
  const [menuOpen, setMenuOpen] = useState(false)
  const [authToken, setAuthToken] = useState()

  const navToDefaultPage = () => {
    navigate(`/`, { hasAccount: true })
    // window does not refresh on navigation change
    window.location.reload()
  }

  const onLogout = () => {
    if (!isOnline || isDbBusy) {
      notifyConfirm({
        message:
          'You are offline or have unsynched changes. Signing out will remove all local data, so we suggest waiting until you are online and all changes are synched (green dot) before signing out.',
        okText: '⚠️ Sign out and clear local data',
        cancelText: 'Cancel',
        onOk: logout,
      })
    } else {
      logout()
    }
  }

  /*
  confirms a token is in local pouch in order to show account menu
  */

  useEffect(() => {
    const _token = getAuthToken()
    if (_token) {
      setAuthToken(true)
    }
  }, [])

  return authToken ? (
    <AccountLoader>
      {(userInfo) => {
        const menuItems = [
          {
            icon: <LogoutSvg />,
            label: 'Sign out',
            action: () => onLogout(),
            actionType: 'logout',
            shortcut: `v${version}`,
          },
        ]

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
            <BaseControl
              onClick={() => setMenuOpen(true)}
              data-test-element="account-menu"
            >
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
                  mt="large"
                  position={{
                    top: 0,
                    right: 0,
                  }}
                >
                  <View
                    ml="small"
                    heightVariant="dropdownMenuItem"
                    justifyContent="center"
                    key="account-name"
                  >
                    <Text color="text.3" variant="uiTextSmall">
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
