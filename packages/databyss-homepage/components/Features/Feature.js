import React from 'react'
import { View } from '@databyss-org/ui/primitives'
import { useMediaQuery } from 'react-responsive'
import breakpoints from '@databyss-org/ui/theming/responsive'
import { pxUnits, borderRadius } from '@databyss-org/ui/theming/views'
import Markdown from '@databyss-org/ui/components/Util/Markdown'
import FeatureHeading from './FeatureHeading'
import FeatureImg from './FeatureImg'

export const featureContentMaxWidth = pxUnits(1200)
export const featureContentMaxHeight = pxUnits(560)
export const featureHeadingMaxWidth = pxUnits(560)

const Feature = ({
  title,
  anchor,
  description,
  leftBgColor,
  rightBgColor,
  descriptionColor,
  imgSrc,
  imgAlt,
  imgWidth,
  imgHeight,
  imgMaxHeight,
  imgHasBoxShadow,
  marginX,
  alignContent,
  videoSrc,
  type,
}) => {
  const isTablet = useMediaQuery({ minWidth: breakpoints.tablet })
  const isDesktop = useMediaQuery({ minWidth: breakpoints.desktop })
  const isLargeDesktop = useMediaQuery({ minWidth: breakpoints.largeDesktop })

  const getImgMaxHeight = () => {
    if (imgMaxHeight) {
      return imgMaxHeight
    }
    return isTablet
      ? '100%'
      : `calc(${featureContentMaxHeight} - ${pxUnits(64)})`
  }

  const formatDescriptionText = (description) => {
    if (Array.isArray(description)) {
      return description.map((text, i) => (
        <p key={i}>
          <Markdown source={text} />
        </p>
      ))
    }
    return description
  }

  return (
    <View backgroundColor="background.1" mx={marginX} alignItems="center">
      <View
        flexGrow="1"
        width="100%"
        flexDirection={isTablet ? 'row' : 'column'}
        mb="extraLarge"
        maxWidth={type === 'dualBg' ? 'none' : featureContentMaxWidth}
      >
        <View
          backgroundColor={type === 'dualBg' ? rightBgColor : 'inherit'}
          width={isTablet ? '50%' : '100%'}
          order={type === 'dualBg' && 2}
        >
          <View
            backgroundColor={type === 'dualBg' ? rightBgColor : 'inherit'}
            py={type === 'default' ? 'none' : 'large'}
            flexGrow="1"
            flexShrink="1"
            justifyContent={alignContent}
            alignItems={
              isLargeDesktop && type === 'default' ? 'flex-end' : 'flex-start'
            }
            maxHeight={featureContentMaxHeight}
            maxWidth={`calc(${featureContentMaxWidth} / 2)`}
          >
            <View
              justifyContent="center"
              px={isDesktop ? 'extraLarge' : 'medium'}
            >
              <FeatureHeading
                anchor={anchor}
                title={title}
                description={formatDescriptionText(description)}
                descriptionColor={
                  type === 'dualBg' ? 'text.2' : descriptionColor
                }
              />
            </View>
          </View>
        </View>
        <View
          backgroundColor={type === 'dualBg' ? leftBgColor : 'inherit'}
          width={isTablet ? '50%' : '100%'}
          order={type === 'dualBg' && 1}
          alignItems={isTablet ? 'flex-end' : 'center'}
        >
          <View
            flexGrow="1"
            px={isDesktop ? 'extraLarge' : 'medium'}
            py={type === 'dualBg' ? 'large' : 'none'}
            alignItems="center"
            justifyContent="center"
            flexBasis={isTablet ? '50%' : 'auto'}
            maxHeight={featureContentMaxHeight}
            maxWidth={`calc(${featureContentMaxWidth} / 2)`}
          >
            {imgSrc && (
              <FeatureImg
                imgSrc={imgSrc}
                imgAlt={imgAlt}
                width={imgWidth}
                height={imgHeight}
                imgHasBoxShadow={imgHasBoxShadow}
                maxHeight={getImgMaxHeight()}
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
    </View>
  )
}

Feature.defaultProps = {
  descriptionColor: 'text.3',
  marginX: 'none',
  alignContent: 'center',
  type: 'default',
  leftBgColor: 'purple.4',
  rightBgColor: 'purple.5',
}

export default Feature
