import React, { useState } from 'react'
import { BaseControl, View, Text, Button, Icon } from '@databyss-org/ui'
import PlaySvg from '@databyss-org/ui/assets/play.svg'
import { MediaTypes } from '@databyss-org/services/interfaces/Block'
import { isHttpInsecure } from './EmbedMedia'

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
    return (
      <View
        backgroundColor="gray.6"
        p="small"
        {...others}
        opacity={process.env.NODE_ENV === 'production' ? 1 : 0.5}
      >
        {mediaType !== MediaTypes.IMAGE && (
          <>
            {mediaType !== MediaTypes.INSTAGRAM && title ? (
              <Text variant="uiTextSmall" color="gray.3" userSelect="none">
                {siteName ?? formatHostname(src)}
              </Text>
            ) : (
              <Button
                variant="uiLink"
                textVariant="uiTextSmall"
                textColor="blue.0"
                href={src}
                target="_blank"
              >
                {siteName ?? formatHostname(src)}
              </Button>
            )}
            {mediaType !== MediaTypes.INSTAGRAM && (
              <Button
                variant="uiLink"
                textColor="blue.0"
                href={src}
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
        {imageSrc && (
          <View
            height={
              mediaType === MediaTypes.IMAGE ||
              mediaType === MediaTypes.INSTAGRAM ||
              !description
                ? '350px'
                : '250px'
            }
            title={title}
            backgroundColor="gray.0"
            justifyContent="center"
            alignItems="center"
            style={
              mediaActive
                ? {}
                : {
                    backgroundImage: `url(${imageSrc})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'contain',
                    backgroundPosition: 'center center',
                  }
            }
          >
            {mediaActive ? (
              <iframe
                seamless
                id={mediaSrc}
                title={mediaSrc}
                src={`${mediaSrc}?autoplay=1`}
                allow="autoplay"
                frameBorder="0px"
                width="100%"
                height="250px"
                allowFullScreen
              />
            ) : (
              <>
                {mediaSrc && (
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
                  src={imageSrc}
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
        {mediaType === MediaTypes.WEBSITE && !imageSrc && (
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
  if (isHttpInsecure(src)) {
    return `${process.env.API_URL}/media/proxy?url=${encodeURIComponent(src!)}`
  }
  return src
}
