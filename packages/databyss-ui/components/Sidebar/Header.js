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

const Header = () => {
  const { isPublicAccount } = useSessionContext()
  const [menuOpen, setMenuOpen] = useState(false)

  const menuItems = [
    {
      label: 'sample@email.com',
      disabled: true,
    },
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
      <>
        <DropdownListItem
          {...menuItem}
          action={menuItem.actionType}
          onPress={() => menuItem.action()}
          key={menuItem.label}
        />
        {menuItems.length !== i + 1 && (
          <Separator color="border.3" spacing="extraSmall" />
        )}
      </>
    ))

  return (
    <View px="em" mb="extraSmall">
      <Grid
        singleRow
        flexWrap="nowrap"
        columnGap="small"
        maxWidth="100%"
        justifyContent="space-between"
      >
        <BaseControl
          href={isPublicAccount() ? 'https://www.databyss.org' : '/'}
        >
          <Text variant="heading4" color="text.3">
            Databyss
          </Text>
        </BaseControl>
        <BaseControl onClick={() => setMenuOpen(true)}>
          <View
            borderVariant="round"
            borderRadius="50%"
            backgroundColor="background.2"
            width={32}
            height={32}
            alignItems="center"
            justifyContent="center"
          >
            <Text variant="heading4">J</Text>
          </View>
          <ThemeProvider theme={theme}>
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
                  <DropdownList />
                </DropdownContainer>
              </ClickAwayListener>
            )}
          </ThemeProvider>
        </BaseControl>
      </Grid>
    </View>
  )
}

export default Header
