import React from 'react'
import View from '@databyss-org/ui/primitives/View/View'
import Text from '@databyss-org/ui/primitives/Text/Text'

export const Logo = ({
  logoSrc,
  logoText,
  alt,
  imgWidth,
  textVariant,
  ...others
}) => (
  <View flexDirection="row" alignItems="center" {...others}>
    <img
      src={logoSrc}
      width={imgWidth}
      height="auto"
      alt={alt}
      css={{
        transition: 'all linear 50ms',
      }}
    />
    {logoText && (
      <Text pl="small" variant={textVariant} color="text.2">
        {logoText}
      </Text>
    )}
  </View>
)
