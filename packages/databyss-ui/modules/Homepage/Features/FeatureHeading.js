import React from 'react'
import { Text, View } from '@databyss-org/ui/primitives'
import { pxUnits } from '@databyss-org/ui/theming/views'

const FeatureHeading = ({
  title,
  description,
  descriptionColor,
  textAlign,
}) => (
  <View maxWidth={pxUnits(560)}>
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
          maxHeight: pxUnits(334),
          overflow: 'scroll',
        }}
      >
        {description}
      </Text>
    )}
  </View>
)

export default FeatureHeading
