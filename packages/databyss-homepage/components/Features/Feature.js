import React from 'react'
import View from '@databyss-org/ui/primitives/View/View'
import { useMediaQuery } from 'react-responsive'
import breakpoints from '@databyss-org/ui/theming/responsive'
import { pxUnits, borderRadius } from '@databyss-org/ui/theming/views'
import Markdown from '@databyss-org/ui/components/Util/Markdown'
import theme from '@databyss-org/ui/theming/theme'
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
  reverseFlow,
  imgProps,
  columnBasis,
  bgColor,
  headingVariant,
  ...others
}) => {
  const isMobile = useMediaQuery({ maxWidth: breakpoints.mobile })
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
    return <Markdown source={description} />
  }

  let flexDirectionReverse = ''
  if (
    reverseFlow ||
    (type === 'dualBg' && typeof reverseFlow === 'undefined')
  ) {
    flexDirectionReverse = '-reverse'
  }

  return (
    <View
      backgroundColor={bgColor}
      mx={marginX}
      // alignItems="center"
      {...others}
    >
      <View
        widthVariant="widePage"
        flex="1"
        width="100%"
        flexDirection={
          isTablet
            ? `row${flexDirectionReverse}`
            : `column${flexDirectionReverse}`
        }
        py={type === 'dualBg' ? 'none' : 'large'}
        // maxWidth={type === 'dualBg' ? 'none' : featureContentMaxWidth}
      >
        <View
          backgroundColor={type === 'dualBg' ? rightBgColor : 'inherit'}
          // width={isTablet ? columnBasis : '100%'}
          flexBasis={isTablet ? columnBasis : '100%'}
          // flex="1"
          flexShrink={1}
          flexGrow={1}
        >
          <View
            backgroundColor={type === 'dualBg' ? rightBgColor : 'inherit'}
            py={type === 'default' ? 'none' : 'large'}
            justifyContent={alignContent}
            // alignItems={
            //   isLargeDesktop && type === 'default' ? 'flex-end' : 'flex-start'
            // }
            maxHeight={featureContentMaxHeight}
            // maxWidth={`calc(${featureContentMaxWidth} / 2)`}
          >
            <View
              justifyContent="center"
              mx={isDesktop ? 'extraLarge' : 'medium'}
              pr={isMobile ? 'small' : 'none'}
            >
              <FeatureHeading
                headingVariant={headingVariant}
                widthVariant="wideContent"
                anchor={anchor}
                title={title}
                description={formatDescriptionText(description)}
                descriptionColor="text.2"
              />
            </View>
          </View>
        </View>
        <View
          backgroundColor={type === 'dualBg' ? leftBgColor : 'inherit'}
          // width={isTablet ? columnBasis : '100%'}
          alignItems="flex-start"
          flexBasis="fit-content"
        >
          <View
            px={isDesktop ? 'extraLarge' : 'medium'}
            py={type === 'dualBg' ? 'large' : 'none'}
            alignItems="center"
            justifyContent="center"
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
                {...imgProps}
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
                  boxShadow: imgHasBoxShadow && theme.buttonShadow.boxShadow,
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
  imgProps: {},
  columnBasis: 'max-content',
}

export default Feature
