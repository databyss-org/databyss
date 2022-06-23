import React from 'react'
import { View, Text } from '@databyss-org/ui/primitives'
import { useMediaQuery } from 'react-responsive'
import breakpoints from '@databyss-org/ui/theming/responsive'

export const SectionHeading = ({ title, anchor, ...others }) => {
  const isDesktop = useMediaQuery({ minWidth: breakpoints.desktop })
  return (
    <View
      px={isDesktop ? 'extraLarge' : 'medium'}
      pb="large"
      mb="large"
      {...others}
    >
      <a name={anchor ?? title}>
        <Text variant="heading3" mt="extraLarge" color="text.3">
          {title}
        </Text>
      </a>
    </View>
  )
}
