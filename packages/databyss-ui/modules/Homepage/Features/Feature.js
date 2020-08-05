import React from 'react'
import { View } from '@databyss-org/ui/primitives'
import FeatureHeading from '@databyss-org/ui/modules/Homepage/Features/FeatureHeading'
import { useMediaQuery } from 'react-responsive'
import {
  tabletBreakpoint,
  desktopBreakpoint,
  largeDesktopBreakpoint,
} from '@databyss-org/ui/theming/mediaBreakpoints'

const StandardFeature = ({ isTablet, img, title, description }) => (
  <View
    flexGrow="1"
    px={isTablet ? 'none' : 'medium'}
    py="extraLarge"
    flexDirection={isTablet ? 'row' : 'column'}
  >
    <View flexShrink="1" mr="large" justifyContent="center">
      <FeatureHeading title={title} description={description} />
    </View>
    {img}
  </View>
)

const DualColorBgFeature = ({
  isTablet,
  isDesktop,
  isLargeDesktop,
  title,
  description,
  img,
  leftBgColor,
  rightBgColor,
}) => (
  <View flexGrow="1" flexDirection={isTablet ? 'row' : 'column'}>
    <View
      backgroundColor={leftBgColor}
      flexGrow="1"
      px={isDesktop ? 'extraLarge' : 'medium'}
      py="large"
      alignItems={isLargeDesktop ? 'flex-end' : 'center'}
    >
      {img}
    </View>
    <View
      backgroundColor={rightBgColor}
      py="large"
      flexGrow="1"
      flexShrink="3"
      justifyContent="center"
    >
      <View
        mt={isTablet ? 'none' : 'large'}
        justifyContent="center"
        px={isDesktop ? 'extraLarge' : 'medium'}
      >
        <FeatureHeading title={title} description={description} />
      </View>
    </View>
  </View>
)

const Feature = ({
  variant,
  img,
  title,
  description,
  leftBgColor,
  rightBgColor,
}) => {
  const isTablet = useMediaQuery(tabletBreakpoint)
  const isDesktop = useMediaQuery(desktopBreakpoint)
  const isLargeDesktop = useMediaQuery(largeDesktopBreakpoint)

  if (variant === 'dualColorBg') {
    return (
      <DualColorBgFeature
        isTablet={isTablet}
        isDesktop={isDesktop}
        isLargeDesktop={isLargeDesktop}
        img={img}
        title={title}
        description={description}
        leftBgColor={leftBgColor}
        rightBgColor={rightBgColor}
      />
    )
  }
  return (
    <StandardFeature
      isTablet={isTablet}
      img={img}
      title={title}
      description={description}
    />
  )
}

export default Feature
