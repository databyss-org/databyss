import React from 'react'
import { BaseControl, View, Text, Grid } from '@databyss-org/ui/primitives'
import theme, { timing } from '@databyss-org/ui/theming/theme'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { useMediaQuery } from 'react-responsive'

const Navbar = ({ lightTheme, navLinks }) => {
  const isTablet = useMediaQuery({ minWidth: theme.breakpoints.tablet })
  const isMobile = useMediaQuery({ maxWidth: theme.breakpoints.mobile })
  const isDesktop = useMediaQuery({ minWidth: theme.breakpoints.desktop })
  return (
    <View
      flexDirection="row"
      justifyContent={isMobile ? 'center' : 'flex-end'}
      width="100%"
      position={isMobile ? 'static' : 'absolute'}
      top="medium"
      right="medium"
      mt={isMobile ? 'medium' : 'none'}
    >
      <Grid singleRow columnGap="em">
        {navLinks.map((link, index) => {
          if (link.mobileOnly && !isMobile) {
            return null
          }
          if (link.desktopOnly && !isDesktop) {
            return null
          }
          if (link.tabletOnly && !isTablet) {
            return null
          }

          return link.separator ? (
            <Text key={index} color="gray.5" variant="uiTextNormal">
              |
            </Text>
          ) : (
            <BaseControl
              key={index}
              href={link.route}
              target={link.target}
              height={pxUnits(26)}
              {...(link.className ? { className: link.className } : {})}
              hoverColor="transparent"
              css={{
                textDecoration: 'none',
                ...(isTablet
                  ? {
                      transition: `${timing.quick}ms ${timing.ease}`,
                      borderBottom: '2px solid transparent',
                      '&:hover': {
                        borderBottom: `2px solid ${theme.colors.purple[1]}`,
                      },
                    }
                  : {
                      borderBottom: `2px solid ${theme.colors.purple[1]}`,
                    }),
              }}
            >
              <Text
                color={lightTheme ? 'text.3' : 'text.4'}
                variant="uiTextNormal"
              >
                {link.name}
              </Text>
            </BaseControl>
          )
        })}
      </Grid>
    </View>
  )
}
export default Navbar
