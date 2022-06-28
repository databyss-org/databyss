import React from 'react'
import { View } from '@databyss-org/ui/primitives'
import breakpoints from '@databyss-org/ui/theming/responsive'
import { useMediaQuery } from 'react-responsive'
import { pxUnits } from '@databyss-org/ui/theming/views'
import theme, { darkTheme } from '@databyss-org/ui/theming/theme'

export const HeroView = ({
  backgroundImgSrc,
  backgroundColor,
  children,
  fixedHeader,
  scrollTop,
  ...others
}) => {
  const isMobile = useMediaQuery({ maxWidth: breakpoints.mobile })

  return (
    <View
      p={isMobile ? 'medium' : 'large'}
      pb={isMobile ? 'extraLarge' : 'largest'}
      width="100%"
      alignItems="center"
      backgroundColor={backgroundColor}
      theme={darkTheme}
      css={{
        background: backgroundImgSrc && `url(${backgroundImgSrc})`,
        backgroundSize: 'cover',
      }}
      {...others}
    >
      {fixedHeader && (
        <View
          position="fixed"
          height={pxUnits(70)}
          width="100%"
          top={0}
          backgroundColor={scrollTop > 25 ? 'background.0' : 'transparent'}
          css={{
            transition: 'all linear 50ms',
          }}
          zIndex={theme.zIndex.sticky}
        />
      )}
      {children}
    </View>
  )
}
