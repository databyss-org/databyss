import React from 'react'
import { View } from '@databyss-org/ui/primitives'
import colors from '@databyss-org/ui/theming/colors'
import {
  EmbedDetail,
  MediaTypes,
} from '@databyss-org/services/interfaces/Block'
// import IframeResizer from 'iframe-resizer-react'
import { Tweet } from 'react-twitter-widgets'
import { parseTweetUrl } from '@databyss-org/services/embeds'
import { EmbedCard, EmbedCardProps } from '../EmbedCard'

export const embedCardPropsFromEmbedDetail = (
  embedDetail: EmbedDetail
): EmbedCardProps => {
  const props: EmbedCardProps = {
    src: embedDetail.src,
    mediaType: embedDetail.mediaType,
  }
  if (embedDetail.mediaType === MediaTypes.IMAGE) {
    props.imageSrc = embedDetail.src
    return props
  }
  if (!embedDetail.openGraphJson) {
    return props
  }

  const _ogData = JSON.parse(embedDetail.openGraphJson)
  if (_ogData.ogTitle) {
    props.title = _ogData?.ogTitle
  }
  if (_ogData.ogDescription) {
    props.description = _ogData?.ogDescription
  }
  if (_ogData.ogImage) {
    if (_ogData?.ogImage?.url) {
      props.imageSrc = _ogData.ogImage.url
    } else if (Array.isArray(_ogData.ogImage)) {
      props.imageSrc = _ogData.ogImage[0].url
    }
  }
  if (_ogData.ogSiteName) {
    props.siteName = _ogData.ogSiteName
  }
  if (_ogData.ogVideo) {
    props.mediaSrc = _ogData.ogVideo.url
  }
  return props
}

const { gray, orange } = colors
export const IframeComponent = ({
  embedDetail,
  highlight,
  ...others
}: {
  highlight: boolean
  embedDetail: EmbedDetail
}) => {
  const IframeChildren = () => {
    if (embedDetail.mediaType === MediaTypes.HTML) {
      return (
        <View backgroundColor={gray[6]} px="small" {...others}>
          <iframe
            id={embedDetail.src}
            title={embedDetail.src}
            srcDoc={embedDetail.src}
            // width={embedDetail.dimensions?.width ?? 100}
            height="350px"
            frameBorder="0px"
          />
        </View>
      )
    }

    const _tweetAttributes = parseTweetUrl(embedDetail.src)
    if (embedDetail.mediaType === MediaTypes.TWITTER && _tweetAttributes) {
      return (
        <View backgroundColor={gray[6]} px="small" {...others}>
          <Tweet
            tweetId={_tweetAttributes.tweetId}
            options={{ width: '350' }}
          />
        </View>
      )
    }
    const embedCardProps = embedCardPropsFromEmbedDetail(embedDetail)

    return <EmbedCard {...embedCardProps} {...others} />
  }
  return (
    <div
      style={{
        border: 2,
        borderStyle: 'solid',
        borderColor: highlight ? orange[0] : `rgba(0,0,0,0.0)`,
      }}
    >
      {IframeChildren()}
    </div>
  )
}
