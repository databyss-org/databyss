import React from 'react'
import { View } from '@databyss-org/ui/primitives'
import { useMediaQuery } from 'react-responsive'
import breakpoints from '@databyss-org/ui/theming/responsive'

export const SectionView = ({ children, defaultSpacing, ...others }) => {
  const isTablet = useMediaQuery({ minWidth: breakpoints.tablet })
  const isDesktop = useMediaQuery({ minWidth: breakpoints.desktop })

  let contentSpacing = defaultSpacing ?? 'none'
  if (isDesktop) {
    contentSpacing = 'extraLarge'
  } else if (isTablet) {
    contentSpacing = 'large'
  }

  return (
    <View
      backgroundColor="background.1"
      m={contentSpacing}
      mb="none"
      alignItems="center"
      {...others}
    >
      {children}
    </View>
  )
}
