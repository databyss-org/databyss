import { BaseControl, View, Text } from '@databyss-org/ui'
import React from 'react'

export interface EmbedCardProps {
  src: string
  description?: string
  imageSrc?: string
  title?: string
}

export const EmbedCard = React.memo(
  ({ src, description, imageSrc, title, ...others }: EmbedCardProps) => {
    console.log('[EmbedCard] render')
    return (
      <View backgroundColor="gray.6" p="small" {...others}>
        <BaseControl pr="medium" href={src} target="_blank">
          <Text variant="uiTextNormalUnderline" color="blue.0">
            {title}
          </Text>
        </BaseControl>
        {description && (
          <View pt="tiny" pb="small">
            <Text variant="uiTextSmall">{description}</Text>
          </View>
        )}
        {imageSrc && (
          <View
            maxHeight="250px"
            title={title}
            style={{
              backgroundImage: `url(${imageSrc})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'contain',
              backgroundPosition: 'left center',
            }}
          >
            <img
              src={imageSrc}
              alt={title}
              style={{ opacity: 0, width: '100%' }}
            />
          </View>
        )}
      </View>
    )
  },
  (prevProps, nextProps) => {
    return prevProps.src === nextProps.src
  }
)
