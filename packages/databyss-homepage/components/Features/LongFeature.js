import React from 'react'
import View from '@databyss-org/ui/primitives/View/View'
import Text from '@databyss-org/ui/primitives/Text/Text'
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
      {paragraphs.map((text, idx) => (
        <Text variant="uiTextMediumLong" mb="medium" key={idx}>
          <Markdown source={text} />
        </Text>
      ))}
    </View>
  )
}
