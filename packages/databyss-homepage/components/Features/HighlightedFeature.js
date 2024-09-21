import React from 'react'
import View from '@databyss-org/ui/primitives/View/View'
import { borderRadius, pxUnits } from '@databyss-org/ui/theming/views'
import Markdown from '@databyss-org/ui/components/Util/Markdown'
import FeatureHeading from './FeatureHeading'
import FeatureImg from './FeatureImg'
import { featureContentMaxWidth } from './Feature'
import { SectionView } from '../SectionView'

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
  ...others
}) => (
  <SectionView defaultSpacing="none" {...others}>
    <View
      backgroundColor={backgroundColor}
      p="large"
      // mb="extraLarge"
      alignItems="center"
      maxWidth={featureContentMaxWidth}
      width="100%"
      css={{ borderRadius }}
    >
      <View widthVariant="modal" alignItems="center">
        <FeatureHeading
          widthVariant="content"
          textAlign="left"
          title={title}
          description={<Markdown source={description} />}
          descriptionColor="text.0"
          borderTop="1px solid"
          borderTopColor="text.3"
          pt={pxUnits(50)}
          pb="small"
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
  </SectionView>
)

HighlightedFeature.defaultProps = {
  backgroundColor: 'transparent',
}

export default HighlightedFeature
