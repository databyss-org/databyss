import React from 'react'
import View from '@databyss-org/ui/primitives/View/View'
import Text from '@databyss-org/ui/primitives/Text/Text'
import { featureHeadingMaxWidth } from './Feature'

const FeatureHeading = ({
  title,
  anchor,
  description,
  descriptionColor,
  textAlign,
}) => (
  <View maxWidth={featureHeadingMaxWidth}>
    <a name={anchor ?? title}>
      <Text variant="heading3" color="text.1" mb="medium" textAlign={textAlign}>
        {title}
      </Text>
    </a>
    {description && (
      <View>
        <Text
          variant="uiTextMedium"
          color={descriptionColor || 'text.3'}
          mb="large"
          textAlign={textAlign}
        >
          {description}
        </Text>
      </View>
    )}
  </View>
)

export default FeatureHeading
