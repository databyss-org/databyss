import React from 'react'
import { BaseControl, View, Text } from '@databyss-org/ui/primitives'
import theme, { timing } from '@databyss-org/ui/theming/theme'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { useLocation } from '@reach/router'

const navLinks = [
  { name: 'Home', route: '/' },
  { name: 'Signup', route: '/signup' },
  { name: 'Log in', route: '/login' },
  { name: 'About', route: '/about' },
]

const Navbar = () => {
  const location = useLocation()
  const isActiveLink = route => route === location.pathname

  return (
    <View flexDirection="row" justifyContent="flex-end" width="100%">
      <View flexDirection="row" maxWidth="400px">
        {navLinks.map((link, index) => (
          <BaseControl
            key={index}
            href={link.route}
            ml="medium"
            height={pxUnits(26)}
            hoverColor="transparent"
            css={{
              textDecoration: 'none',
              borderBottom: isActiveLink(link.route)
                ? `2px solid ${theme.colors.purple[1]}`
                : '2px solid transparent',
              transition: `${timing.quick}ms ${timing.ease}`,
              '&:hover': {
                borderBottom: `2px solid ${theme.colors.purple[1]}`,
              },
            }}
          >
            <Text color="text.5" variant="uiTextNormal">
              {link.name}
            </Text>
          </BaseControl>
        ))}
      </View>
    </View>
  )
}

export default Navbar
