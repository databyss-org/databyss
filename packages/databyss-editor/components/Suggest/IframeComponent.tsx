import React, { useMemo, useState } from 'react'
import { View, Text, BaseControl } from '@databyss-org/ui/primitives'
import colors from '@databyss-org/ui/theming/colors'
import { MediaTypes } from '@databyss-org/services/interfaces/Block'

const parseOgData = (serializedData: string | undefined) => {
  if (!serializedData) {
    return null
  }
  const ogData = {
    title: undefined,
    description: undefined,
    image: undefined,
  }

  const _ogData = JSON.parse(serializedData)
  if (_ogData.ogTitle) {
    ogData.title = _ogData?.ogTitle
  }
  if (_ogData.ogDescription) {
    ogData.description = _ogData?.ogDescription
  }
  if (_ogData.ogImage) {
    if (_ogData?.ogImage?.url) {
      ogData.image = _ogData.ogImage.url
    } else if (Array.isArray(_ogData.ogImage)) {
      ogData.image = _ogData.ogImage[0].url
    }
  }
  return ogData.title ? ogData : null
}

const { gray, orange, blue } = colors
export const IframeComponent = ({
  src,
  height,
  width,
  mediaType,
  highlight,
  openGraphData,
}: {
  src: string
  height: number
  width: number
  mediaType: MediaTypes
  highlight: boolean
  openGraphData?: string
}) => {
  const [mediaActive, setMediaActive] = useState(false)

  return useMemo(() => {
    const IframeChildren = () => {
      if (mediaType === MediaTypes.HTML) {
        return (
          <View backgroundColor={gray[6]}>
            <iframe
              id={src}
              title={src}
              srcDoc={src}
              width={width}
              height={height}
              // border="0px"
              frameBorder="0px"
            />
          </View>
        )
      }

      const ogData = parseOgData(openGraphData)
      if (mediaType === MediaTypes.WEBSITE && ogData) {
        const onTitleClick = () => {
          window.open(src)
        }
        return (
          <View backgroundColor={gray[6]} p="small">
            <BaseControl pr="medium" onClick={onTitleClick}>
              <Text variant="heading4" color={blue[0]}>
                {ogData.title}
              </Text>
            </BaseControl>
            <View>
              <Text>{ogData.description}</Text>
            </View>
            {ogData?.image ? (
              <img src={ogData?.image} alt={ogData.title} />
            ) : null}
          </View>
        )
      }

      if (mediaType === MediaTypes.YOUTUBE && ogData) {
        const onPlayClick = () => {
          setMediaActive(true)
        }
        return mediaActive ? (
          <iframe
            seamless
            id={src}
            title={src}
            src={`${src}?autoplay=1`}
            allow="autoplay"
            // border="0px"
            frameBorder="0px"
            height={height}
            width={width}
          />
        ) : (
          <View backgroundColor={gray[6]} p="small">
            <BaseControl pr="medium" onClick={onPlayClick}>
              <Text variant="heading4" color={blue[0]}>
                play video
              </Text>
            </BaseControl>
            {ogData?.image ? (
              <img src={ogData?.image} alt={ogData.title} />
            ) : null}
          </View>
        )
      }

      return (
        <iframe
          seamless
          id={src}
          title={src}
          src={src}
          // border="0px"
          frameBorder="0px"
          height={height}
          width={width}
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
        }}
      >
        <IframeChildren />
      </div>
    )
  }, [src, mediaActive])
}
