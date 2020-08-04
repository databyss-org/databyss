import React from 'react'
import { View, Text } from '@databyss-org/ui/primitives'
import { borderRadius } from '@databyss-org/ui/theming/views'
import theme from '@databyss-org/ui/theming/theme'

const HighlightedFeature = ({
  backgroundColor,
  title,
  description,
  imgSrc,
}) => (
  <View
    backgroundColor={backgroundColor}
    p="large"
    alignItems="center"
    css={{ borderRadius }}
  >
    <View widthVariant="modal">
      <Text variant="heading3" color="text.1" mb="medium" textAlign="center">
        {title}
      </Text>
      <Text variant="uiTextMedium" color="text.3" textAlign="center" mb="large">
        {description}
      </Text>
      <img
        src={imgSrc}
        alt="Deep search"
        width="100%"
        css={{
          alignSelf: 'flex-start',
          boxShadow: theme.buttonShadow.boxShadow,
          borderRadius,
        }}
      />
    </View>
  </View>
)

export default HighlightedFeature
