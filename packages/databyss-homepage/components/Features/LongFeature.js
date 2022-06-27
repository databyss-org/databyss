import React from 'react'
import { View, Text } from '@databyss-org/ui/primitives'
import Markdown from '@databyss-org/ui/components/Util/Markdown'
import { useMediaQuery } from 'react-responsive'
import breakpoints from '@databyss-org/ui/theming/responsive'

export const LongFeature = ({ paragraphs, ...others }) => {
  const isDesktop = useMediaQuery({ minWidth: breakpoints.desktop })
  return (
    <View
      px={isDesktop ? 'extraLarge' : 'medium'}
      {...others}
      widthVariant="page"
      mb="extraLarge"
      pt="large"
    >
      {paragraphs.map((text) => (
        <Text variant="uiTextMediumLong" mb="medium">
          <Markdown source={text} />
        </Text>
      ))}
    </View>
  )
}
