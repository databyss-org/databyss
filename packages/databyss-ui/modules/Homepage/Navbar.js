import React from 'react'
import { BaseControl, View, Text } from '@databyss-org/ui/primitives'

const navLinks = [
  { name: 'Home', route: '/' },
  //   { name: 'Signup', route: '/' },
  { name: 'Log in', route: '/login' },
  { name: 'About', route: '/about' },
]

const Navbar = () => (
  <View flexDirection="row" justifyContent="flex-end" width="100%">
    <View flexDirection="row" maxWidth="400px">
      {navLinks.map((link, index) => (
        <BaseControl
          key={index}
          href={link.route}
          ml="medium"
          height="30px"
          textDecoration="none"
        >
          <Text color="text.5" variant="uiTextNormal">
            {link.name}
          </Text>
        </BaseControl>
      ))}
    </View>
  </View>
)

export default Navbar
