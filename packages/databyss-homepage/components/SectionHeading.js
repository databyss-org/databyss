import React from 'react'
import { View, Text } from '@databyss-org/ui/primitives'
import { useMediaQuery } from 'react-responsive'
import breakpoints from '@databyss-org/ui/theming/responsive'
import { darkTheme } from '@databyss-org/ui/theming/theme'

export const SectionHeading = ({ title, anchor, ...others }) => {
  const isDesktop = useMediaQuery({ minWidth: breakpoints.desktop })
  return (
    <View
      theme={darkTheme}
      backgroundColor="background.3"
      px={isDesktop ? 'extraLarge' : 'medium'}
      pb="large"
      {...others}
    >
      <a name={anchor ?? title}>
        <Text variant="bodySectionHeading1" mt="large" color="text.0">
          {title}
        </Text>
      </a>
    </View>
  )
}
