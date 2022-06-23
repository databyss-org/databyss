import React from 'react'
import { View } from '@databyss-org/ui/primitives'
import breakpoints from '@databyss-org/ui/theming/responsive'
import { useMediaQuery } from 'react-responsive'

export const HeroView = ({
  backgroundImgSrc,
  backgroundColor,
  children,
  ...others
}) => {
  const isMobile = useMediaQuery({ maxWidth: breakpoints.mobile })

  return (
    <View
      p={isMobile ? 'medium' : 'large'}
      pb={isMobile ? 'extraLarge' : 'largest'}
      width="100%"
      alignItems="center"
      css={{
        backgroundColor,
        background: backgroundImgSrc && `url(${backgroundImgSrc})`,
      }}
      {...others}
    >
      {children}
    </View>
  )
}
