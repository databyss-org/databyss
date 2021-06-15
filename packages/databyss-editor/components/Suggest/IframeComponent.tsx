import React, { useMemo, useState } from 'react'
import { View, Text, BaseControl } from '@databyss-org/ui/primitives'
import colors from '@databyss-org/ui/theming/colors'
import {
  EmbedDetail,
  MediaTypes,
} from '@databyss-org/services/interfaces/Block'
import { EmbedCard, EmbedCardProps } from '../EmbedCard'

const embedCardPropsFromEmbedDetail = (
  embedDetail: EmbedDetail
): EmbedCardProps => {
  const props: EmbedCardProps = {
    src: embedDetail.src,
  }
  if (!embedDetail.openGraphJson) {
    return props
  }

  const _ogData = JSON.parse(embedDetail.openGraphJson)
  console.log('[opengraph]', _ogData)
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

const { gray, orange, blue } = colors
export const IframeComponent = ({
  embedDetail,
  highlight,
  ...others
}: {
  highlight: boolean
  embedDetail: EmbedDetail
}) => {
  const [mediaActive, setMediaActive] = useState(false)

  const IframeChildren = () => {
    if (embedDetail.mediaType === MediaTypes.HTML) {
      return (
        <View backgroundColor={gray[6]}>
          <iframe
            id={embedDetail.src}
            title={embedDetail.src}
            srcDoc={embedDetail.src}
            width={embedDetail.dimensions?.width ?? 100}
            height={embedDetail.dimensions?.height ?? 100}
            // border="0px"
            frameBorder="0px"
          />
        </View>
      )
    }

    const embedCardProps = embedCardPropsFromEmbedDetail(embedDetail)
    if (
      (embedDetail.mediaType === MediaTypes.WEBSITE ||
        embedDetail.mediaType === MediaTypes.YOUTUBE) &&
      embedDetail.openGraphJson
    ) {
      return <EmbedCard {...embedCardProps} {...others} />
    }

    // if (
    //   embedDetail.mediaType === MediaTypes.YOUTUBE &&
    //   embedDetail.openGraphJson
    // ) {
    //   const onPlayClick = () => {
    //     setMediaActive(true)
    //   }
    //   return mediaActive ? (
    //     <iframe
    //       seamless
    //       id={embedDetail.src}
    //       title={embedDetail.src}
    //       src={`${embedDetail.src}?autoplay=1`}
    //       allow="autoplay"
    //       // border="0px"
    //       frameBorder="0px"
    //       // height={height}
    //       // width={width}
    //     />
    //   ) : (
    //     <EmbedCard {...embedCardProps} {...others} />
    //   )
    // }

    return (
      <iframe
        seamless
        id={embedDetail.src}
        title={embedDetail.src}
        src={embedDetail.src}
        // border="0px"
        frameBorder="0px"
        // height={height}
        // width={width}
      />
    )
  }
  return (
    <div
      style={{
        // width,
        // height,
        border: 2,
        borderStyle: 'solid',
        borderColor: highlight ? orange[0] : `rgba(0,0,0,0.0)`,
        // opacity: 0.8,
      }}
    >
      {IframeChildren()}
    </div>
  )
}
