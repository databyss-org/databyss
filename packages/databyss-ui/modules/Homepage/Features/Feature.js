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
import { pxUnits } from '@databyss-org/ui/theming/views'

const Feature = ({
  svgImg,
  title,
  description,
  leftBgColor,
  rightBgColor,
  descriptionColor,
  imgSrc,
  imgAlt,
  imgOnRightSide,
  noBg,
  marginX,
}) => {
  const isTablet = useMediaQuery(tabletBreakpoint)
  const isDesktop = useMediaQuery(desktopBreakpoint)
  const isLargeDesktop = useMediaQuery(largeDesktopBreakpoint)

  return (
    <View
      backgroundColor="background.1"
      mx={marginX}
      mb="none"
      alignItems={isLargeDesktop ? 'center' : 'flex-start'}
    >
      <View
        flexGrow="1"
        width="100%"
        flexDirection={isTablet ? 'row' : 'column'}
        mb="extraLarge"
        maxWidth={pxUnits(largeDesktopBreakpoint.minWidth)}
      >
        <View
          backgroundColor={noBg ? 'inherit' : leftBgColor}
          flexGrow="1"
          px={isDesktop ? 'extraLarge' : 'medium'}
          py={noBg ? 'none' : 'large'}
          alignItems="center"
          flexBasis={isTablet ? '50%' : 'auto'}
          order={imgOnRightSide && 2}
        >
          <FeatureImg imgSrc={imgSrc} imgAlt={imgAlt} svgImg={svgImg} />
        </View>
        <View
          backgroundColor={noBg ? 'inherit' : rightBgColor}
          py={noBg ? 'none' : 'large'}
          flexGrow="1"
          flexShrink="1"
          justifyContent="center"
          order={imgOnRightSide && 1}
          alignItems={
            isLargeDesktop && imgOnRightSide ? 'flex-end' : 'flex-start'
          }
        >
          <View
            mt={isTablet || imgOnRightSide ? 'none' : 'large'}
            justifyContent="center"
            px={isDesktop ? 'extraLarge' : 'medium'}
          >
            <FeatureHeading
              title={title}
              description={description}
              descriptionColor={descriptionColor}
            />
          </View>
        </View>
      </View>
    </View>
  )
}

Feature.defaultProps = {
  descriptionColor: 'text.3',
  marginX: 'none',
}

export default Feature
