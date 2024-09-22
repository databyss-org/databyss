import React from 'react'
import View from '@databyss-org/ui/primitives/View/View'
import Text from '@databyss-org/ui/primitives/Text/Text'
import Markdown from '@databyss-org/ui/components/Util/Markdown'
import { useMediaQuery } from 'react-responsive'
import breakpoints from '@databyss-org/ui/theming/responsive'
import { darkTheme } from '@databyss-org/ui/theming/theme'

export const LongFeature = ({ paragraphs, ...others }) => {
  const isDesktop = useMediaQuery({ minWidth: breakpoints.desktop })
  const isMobile = useMediaQuery({ maxWidth: breakpoints.mobile })

  return (
    <View bg="background.3">
      <View
        mx={isDesktop ? 'extraLarge' : 'medium'}
        pr={isMobile ? 'small' : 'none'}
        {...others}
        widthVariant="wideContent"
        mb="extraLarge"
        pt="large"
      >
        {paragraphs.map((text, idx) => (
          <Text variant="uiTextMediumLong" mb="medium" key={idx}>
            <Markdown source={text} />
          </Text>
        ))}
      </View>
    </View>
  )
}
