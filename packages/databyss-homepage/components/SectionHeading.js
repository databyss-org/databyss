import React from 'react'
import { View, Text } from '@databyss-org/ui/primitives'
import { useMediaQuery } from 'react-responsive'
import breakpoints from '@databyss-org/ui/theming/responsive'
import { darkTheme } from '@databyss-org/ui/theming/theme'
import { pxUnits } from '@databyss-org/ui/theming/views'

export const SectionHeading = ({ title, anchor, ...others }) => {
  const isDesktop = useMediaQuery({ minWidth: breakpoints.desktop })
  return (
    <View
      theme={darkTheme}
      backgroundColor="background.3"
      px={isDesktop ? 'extraLarge' : 'medium'}
      pb="large"
      position="relative"
      {...others}
    >
      <a
        name={anchor ?? title}
        css={{
          position: 'absolute',
          top: pxUnits(-60),
          zIndex: -1,
        }}
      >
        {title}
      </a>
      <Text variant="bodySectionHeading1" mt="large" color="text.0">
        {title}
      </Text>
    </View>
  )
}
