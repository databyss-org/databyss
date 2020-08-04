import React from 'react'
import { View, Text } from '@databyss-org/ui/primitives'
import { borderRadius } from '@databyss-org/ui/theming/views'
import theme from '@databyss-org/ui/theming/theme'
import FeatureHeading from '@databyss-org/ui/modules/Homepage/Features/FeatureHeading'

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
    <View widthVariant="modal" alignItems="center">
      <FeatureHeading
        textAlign="center"
        title={title}
        description={description}
      />
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
