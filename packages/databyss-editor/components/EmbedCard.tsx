import React, { useState } from 'react'
import { BaseControl, View, Text, Button, Icon } from '@databyss-org/ui'
import PlaySvg from '@databyss-org/ui/assets/play.svg'

export interface EmbedCardProps {
  src: string
  description?: string
  imageSrc?: string
  title?: string
  siteName?: string
  mediaSrc?: string
}

export const EmbedCard = React.memo(
  ({
    src,
    description,
    imageSrc,
    title,
    siteName,
    mediaSrc,
    ...others
  }: EmbedCardProps) => {
    const [mediaActive, setMediaActive] = useState(false)
    return (
      <View backgroundColor="gray.6" p="small" {...others}>
        <Text variant="uiTextSmall" color="gray.3" userSelect="none">
          {siteName ?? formatHostname(src)}
        </Text>
        <Button variant="uiLink" textColor="blue.0" href={src} target="_blank">
          {title}
        </Button>
        {description && (
          <View pt="tiny" pb="small">
            <Text variant="uiTextSmall" userSelect="none">
              {description}
            </Text>
          </View>
        )}
        {imageSrc && (
          <View
            maxHeight="250px"
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
                    backgroundSize: 'cover',
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
                  style={{ opacity: 0, width: '100%', pointerEvents: 'none' }}
                  onDragStart={(e) => e.preventDefault()}
                />
              </>
            )}
          </View>
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
