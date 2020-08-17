import React from 'react'
import { View } from '@databyss-org/ui/primitives'
import { borderRadius } from '@databyss-org/ui/theming/views'
import FeatureHeading from '@databyss-org/ui/modules/Homepage/Features/FeatureHeading'
import FeatureImg from '@databyss-org/ui/modules/Homepage/Features/FeatureImg'
import { featureContentMaxWidth } from '@databyss-org/ui/modules/Homepage/Features/Feature'
import { useMediaQuery } from 'react-responsive'
import breakpoints from '@databyss-org/ui/theming/responsive'

const HighlightedFeature = ({
  backgroundColor,
  title,
  description,
  imgSrc,
  imgAlt,
  imgWidth,
  imgHeight,
  imgMaxHeight,
  videoSrc,
}) => {
  const isTablet = useMediaQuery({ minWidth: breakpoints.tablet })
  const isDesktop = useMediaQuery({ minWidth: breakpoints.desktop })

  const getContentSpacing = () => {
    if (isDesktop) {
      return 'extraLarge'
    }
    if (isTablet) {
      return 'large'
    }
    return 'none'
  }

  return (
    <View
      backgroundColor="background.1"
      m={getContentSpacing()}
      mb="none"
      alignItems="center"
    >
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
          {imgSrc && (
            <FeatureImg
              imgSrc={imgSrc}
              imgAlt={imgAlt}
              maxHeight={imgMaxHeight}
              width={imgWidth}
              height={imgHeight}
            />
          )}
          {videoSrc && (
            <video
              src={videoSrc}
              width="100%"
              height="100%"
              autoPlay
              loop
              muted
              preload="auto"
              css={{
                borderRadius,
              }}
            />
          )}
        </View>
      </View>
    </View>
  )
}

HighlightedFeature.defaultProps = {
  margin: 'large',
  backgroundColor: 'background.2',
}

export default HighlightedFeature
