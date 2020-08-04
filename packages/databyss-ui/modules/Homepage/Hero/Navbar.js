import React from 'react'
import { BaseControl, View, Text } from '@databyss-org/ui/primitives'
import theme, { timing } from '@databyss-org/ui/theming/theme'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { useLocation } from '@reach/router'

const Navbar = ({ lightTheme, navLinks }) => {
  const location = useLocation()
  const isActiveLink = route => route === location.pathname

  const getTextColor = isActiveLink => {
    if (lightTheme) {
      return isActiveLink ? 'text.2' : 'text.3'
    }
    return isActiveLink ? 'text.5' : 'text.4'
  }

  return (
    <View
      flexDirection="row"
      justifyContent="flex-end"
      width="100%"
      position="absolute"
      top="medium"
      right="medium"
    >
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
            <Text
              color={getTextColor(isActiveLink(link.route))}
              variant="uiTextNormal"
            >
              {link.name}
            </Text>
          </BaseControl>
        ))}
      </View>
    </View>
  )
}

export default Navbar
