import React from 'react'
import { View } from '@databyss-org/ui/primitives'
import { borderRadius, pxUnits } from '@databyss-org/ui/theming/views'
import FeatureHeading from '@databyss-org/ui/modules/Homepage/Features/FeatureHeading'
import FeatureImg from '@databyss-org/ui/modules/Homepage/Features/FeatureImg'
import { largeDesktopBreakpoint } from '@databyss-org/ui/theming/mediaBreakpoints'

const HighlightedFeature = ({
  backgroundColor,
  title,
  description,
  imgSrc,
  imgAlt,
  svgImg,
}) => (
  <View
    backgroundColor={backgroundColor}
    p="large"
    mb="extraLarge"
    alignItems="center"
    maxWidth={pxUnits(largeDesktopBreakpoint.minWidth)}
    width="100%"
    css={{ borderRadius }}
  >
    <View widthVariant="modal" alignItems="center">
      <FeatureHeading
        textAlign="center"
        title={title}
        description={description}
      />
      <FeatureImg imgSrc={imgSrc} imgAlt={imgAlt} svgImg={svgImg} />
    </View>
  </View>
)

export default HighlightedFeature
