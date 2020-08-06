import React from 'react'
import { View } from '@databyss-org/ui/primitives'
import { borderRadius, pxUnits } from '@databyss-org/ui/theming/views'
import FeatureHeading from '@databyss-org/ui/modules/Homepage/Features/FeatureHeading'
import FeatureImg from '@databyss-org/ui/modules/Homepage/Features/FeatureImg'
import { largeDesktopBreakpoint } from '@databyss-org/ui/theming/mediaBreakpoints'
import { useMediaQuery } from 'react-responsive'

const HighlightedFeature = ({
  backgroundColor,
  title,
  description,
  imgSrc,
  imgAlt,
  svgImg,
  margin,
}) => {
  const isLargeDesktop = useMediaQuery(largeDesktopBreakpoint)

  return (
    <View
      backgroundColor="background.1"
      m={margin}
      mb="none"
      alignItems={isLargeDesktop ? 'center' : 'flex-start'}
    >
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
    </View>
  )
}

HighlightedFeature.defaultProps = {
  margin: 'large',
}

export default HighlightedFeature
