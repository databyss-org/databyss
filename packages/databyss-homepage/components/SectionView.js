import React from 'react'
import View from '@databyss-org/ui/primitives/View/View'
import { useMediaQuery } from 'react-responsive'
import breakpoints from '@databyss-org/ui/theming/responsive'

export const SectionView = ({
  children,
  defaultSpacing,
  backgroundColor,
  ...others
}) => {
  const isTablet = useMediaQuery({ minWidth: breakpoints.tablet })
  const isDesktop = useMediaQuery({ minWidth: breakpoints.desktop })

  let contentSpacing = 'none'
  if (isDesktop) {
    contentSpacing = 'extraLarge'
  } else if (isTablet) {
    contentSpacing = 'large'
  }

  return (
    <View
      backgroundColor={backgroundColor}
      m={defaultSpacing ?? contentSpacing}
      mb="none"
      alignItems="center"
      {...others}
    >
      {children}
    </View>
  )
}
