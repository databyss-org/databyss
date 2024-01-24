import React, { useState } from 'react'
import { BaseControl, View, Text, Button, Icon } from '@databyss-org/ui'
import PlaySvg from '@databyss-org/ui/assets/play.svg'
import { MediaTypes } from '@databyss-org/services/interfaces/Block'
import { LoadingFallback } from '@databyss-org/ui/components'
import { isHttpInsecure } from './EmbedMedia'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('../../databyss-desktop/src/eapi').default

export interface EmbedCardProps {
  src: string
  mediaType: MediaTypes
  description?: string
  imageSrc?: string
  title?: string
  siteName?: string
  mediaSrc?: string
}

export const EmbedCard = React.memo(
  ({
    src,
    mediaType,
    description,
    imageSrc,
    title,
    siteName,
    mediaSrc,
    ...others
  }: EmbedCardProps) => {
    const [mediaActive, setMediaActive] = useState(false)
    if (!src) {
      return <LoadingFallback />
    }
    let _src = src
    if (eapi && src.includes('media/proxy')) {
      _src = decodeURIComponent(src.split('url=')[1])
    }
    let _mediaSrc = mediaSrc
    if (eapi && mediaSrc?.includes('media/proxy')) {
      _mediaSrc = decodeURIComponent(mediaSrc.split('url=')[1])
    }
    let _imageSrc = imageSrc
    if (eapi && imageSrc?.includes('media/proxy')) {
      _imageSrc = decodeURIComponent(imageSrc.split('url=')[1])
    }
    return (
      <View
        backgroundColor="background.2"
        p="small"
        {...others}
        // opacity={process.env.NODE_ENV === 'production' ? 1 : 0.5}
      >
        {mediaType !== MediaTypes.IMAGE && (
          <>
            {mediaType !== MediaTypes.INSTAGRAM && title ? (
              <Text variant="uiTextSmall" color="text.2" userSelect="none">
                {siteName ?? formatHostname(_src)}
              </Text>
            ) : (
              <Button
                variant="uiLink"
                textVariant="uiTextSmall"
                textColor="blue.2"
                href={_src}
                target="_blank"
              >
                {siteName ?? formatHostname(_src)}
              </Button>
            )}
            {mediaType !== MediaTypes.INSTAGRAM && (
              <Button
                variant="uiLink"
                textColor="blue.2"
                href={_src}
                target="_blank"
                mb="small"
              >
                {title}
              </Button>
            )}
          </>
        )}
        {description && (
          <View mb="small">
            <Text variant="uiTextMultiline">{description}</Text>
          </View>
        )}
        {_imageSrc && (
          <View
            height={
              mediaType === MediaTypes.IMAGE ||
              mediaType === MediaTypes.INSTAGRAM ||
              !description
                ? '350px'
                : '250px'
            }
            title={title}
            backgroundColor="background.3"
            justifyContent="center"
            alignItems="center"
            style={
              mediaActive
                ? {}
                : {
                    backgroundImage: `url(${encodeURI(_imageSrc)})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'contain',
                    backgroundPosition: 'center center',
                  }
            }
          >
            {mediaActive ? (
              <iframe
                seamless
                id={_mediaSrc}
                title={_mediaSrc}
                src={`${_mediaSrc}?autoplay=1`}
                allow="autoplay"
                frameBorder="0px"
                width="100%"
                height="250px"
                allowFullScreen
              />
            ) : (
              <>
                {_mediaSrc && (
                  <View
                    backgroundColor="#00000055"
                    position="absolute"
                    borderRadius="default"
                    overflow="hidden"
                  >
                    <BaseControl onPress={() => setMediaActive(true)}>
                      <Icon sizeVariant="extraLarge" color="white">
                        <PlaySvg />
                      </Icon>
                    </BaseControl>
                  </View>
                )}
                <img
                  src={_imageSrc}
                  alt={title}
                  style={{
                    opacity: 0,
                    width: '100%',
                    height:
                      mediaType === MediaTypes.IMAGE ||
                      mediaType === MediaTypes.INSTAGRAM ||
                      !description
                        ? '350px'
                        : '250px',
                  }}
                  onDragStart={(e) => e.preventDefault()}
                />
              </>
            )}
          </View>
        )}
        {mediaType === MediaTypes.WEBSITE && !_imageSrc && (
          <iframe
            src={proxySrc(src)}
            height="350px"
            title={src}
            frameBorder="0px"
          />
        )}
      </View>
    )
  },
  (prevProps, nextProps) => prevProps.src === nextProps.src
)

function formatHostname(src: string) {
  const uri = new URL(src)
  return uri.hostname
}

function proxySrc(src: string) {
  if (!eapi && isHttpInsecure(src)) {
    return `${process.env.API_URL}/media/proxy?url=${encodeURIComponent(src!)}`
  }
  return src
}
