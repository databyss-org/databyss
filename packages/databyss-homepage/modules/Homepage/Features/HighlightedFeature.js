import React from 'react'
import { View } from '@databyss-org/ui/primitives'
import { borderRadius } from '@databyss-org/ui/theming/views'
import Markdown from '@databyss-org/ui/components/Util/Markdown'
import FeatureHeading from './FeatureHeading'
import FeatureImg from './FeatureImg'
import { featureContentMaxWidth } from './Feature'
import { SectionView } from '../../../components/SectionView'

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
}) => (
  <SectionView>
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
          description={<Markdown source={description} />}
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
  margin: 'large',
  backgroundColor: 'background.2',
}

export default HighlightedFeature
