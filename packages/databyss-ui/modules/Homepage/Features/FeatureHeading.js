import React from 'react'
import { Text, View } from '@databyss-org/ui/primitives'
import { pxUnits } from '@databyss-org/ui/theming/views'
import {
  featureContentMaxHeight,
  featureHeadingMaxWidth,
} from '@databyss-org/ui/modules/Homepage/Features/Feature'

const FeatureHeading = ({
  title,
  description,
  descriptionColor,
  textAlign,
}) => (
  <View maxWidth={featureHeadingMaxWidth}>
    <Text variant="heading3" color="text.1" mb="medium" textAlign={textAlign}>
      {title}
    </Text>
    {description && (
      <Text
        variant="uiTextMedium"
        color={descriptionColor || 'text.3'}
        mb="large"
        textAlign={textAlign}
        css={{
          maxHeight: `calc(${featureContentMaxHeight} - ${pxUnits(124)})`,
          overflow: 'scroll',
        }}
      >
        {description}
      </Text>
    )}
  </View>
)

export default FeatureHeading
