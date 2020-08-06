import React from 'react'
import { View } from '@databyss-org/ui/primitives'
import { borderRadius } from '@databyss-org/ui/theming/views'
import FeatureHeading from '@databyss-org/ui/modules/Homepage/Features/FeatureHeading'
import FeatureImg from '@databyss-org/ui/modules/Homepage/Features/FeatureImg'
import { featureContentMaxWidth } from '@databyss-org/ui/modules/Homepage/Features/Feature'

const HighlightedFeature = ({
  backgroundColor,
  title,
  description,
  imgSrc,
  imgAlt,
  svgImg,
  margin,
  children,
}) => (
  <View backgroundColor="background.1" m={margin} mb="none" alignItems="center">
    <View
      backgroundColor={backgroundColor}
      p="large"
      mb="extraLarge"
      alignItems="center"
      maxWidth={featureContentMaxWidth}
      width="100%"
      css={{ borderRadius }}
    >
      <View widthVariant="modal" alignItems="center">
        <FeatureHeading
          textAlign="center"
          title={title}
          description={description}
        />
        {children || (
          <FeatureImg imgSrc={imgSrc} imgAlt={imgAlt} svgImg={svgImg} />
        )}
      </View>
    </View>
  </View>
)

HighlightedFeature.defaultProps = {
  margin: 'large',
  backgroundColor: 'background.2',
}

export default HighlightedFeature
