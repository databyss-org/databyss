import React from 'react'
import { View } from '@databyss-org/ui/primitives'
import FeatureHeading from '@databyss-org/ui/modules/Homepage/Features/FeatureHeading'
import FeatureImg from '@databyss-org/ui/modules/Homepage/Features/FeatureImg'
import { useMediaQuery } from 'react-responsive'
import {
  tabletBreakpoint,
  desktopBreakpoint,
  largeDesktopBreakpoint,
} from '@databyss-org/ui/theming/mediaBreakpoints'
import { pxUnits, borderRadius } from '@databyss-org/ui/theming/views'

export const featureContentMaxWidth = pxUnits(1200)
export const featureContentMaxHeight = pxUnits(560)
export const featureHeadingMaxWidth = pxUnits(560)

const Feature = ({
  title,
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
  const isTablet = useMediaQuery(tabletBreakpoint)
  const isDesktop = useMediaQuery(desktopBreakpoint)
  const isLargeDesktop = useMediaQuery(largeDesktopBreakpoint)

  const getImgMaxHeight = () => {
    if (imgMaxHeight) {
      return imgMaxHeight
    }
    return isTablet
      ? '100%'
      : `calc(${featureContentMaxHeight} - ${pxUnits(64)})`
  }

  const formatDescriptionText = description => {
    if (Array.isArray(description)) {
      return description.map(text => <p>{text}</p>)
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
        maxWidth={
          type === 'dualBg'
            ? pxUnits(largeDesktopBreakpoint.minWidth)
            : featureContentMaxWidth
        }
      >
        <View
          backgroundColor={type === 'dualBg' ? rightBgColor : 'inherit'}
          py={type === 'default' ? 'none' : 'large'}
          flexGrow="1"
          flexShrink="1"
          justifyContent={alignContent}
          order={type === 'dualBg' && 2}
          alignItems={
            isLargeDesktop && type === 'default' ? 'flex-end' : 'flex-start'
          }
          maxHeight={featureContentMaxHeight}
          css={{
            borderRadius: isLargeDesktop
              ? `0 ${borderRadius} ${borderRadius} 0`
              : '0',
          }}
        >
          <View
            justifyContent="center"
            px={isDesktop ? 'extraLarge' : 'medium'}
          >
            <FeatureHeading
              title={title}
              description={formatDescriptionText(description)}
              descriptionColor={type === 'dualBg' ? 'text.2' : descriptionColor}
            />
          </View>
        </View>
        <View
          backgroundColor={type === 'dualBg' ? leftBgColor : 'inherit'}
          flexGrow="1"
          px={isDesktop ? 'extraLarge' : 'medium'}
          py={type === 'dualBg' ? 'large' : 'none'}
          alignItems="center"
          justifyContent="center"
          flexBasis={isTablet ? '50%' : 'auto'}
          order={type === 'dualBg' && 1}
          maxHeight={featureContentMaxHeight}
          css={{
            borderRadius: isLargeDesktop
              ? `${borderRadius} 0 0 ${borderRadius}`
              : '0',
          }}
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
