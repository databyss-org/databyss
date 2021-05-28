import React, { useEffect } from 'react'
import { View, Text } from '@databyss-org/ui/primitives'
import colors from '@databyss-org/ui/theming/colors'
import { setEmbed } from '@databyss-org/services/embeds/setEmbed'
import { useOpenGraph } from '@databyss-org/data/pouchdb/hooks/useOpenGraph'
import { BlockType, Embed } from '@databyss-org/services/interfaces/Block'

export const UnfetchedMedia = ({ atomicId, src }) => {
  //   const blocksRes = useBlocks(BlockType.Embed)
  const graphRes = useOpenGraph(src)

  useEffect(() => {
    if (graphRes.data) {
      const _attributes = graphRes.data

      const _entity: Embed = {
        type: BlockType.Embed,
        // remove atomic symbol
        text: { textValue: _attributes.title, ranges: [] },
        detail: {
          title: _attributes.title,
          src: _attributes.src,
          dimensions: {
            width: _attributes.width,
            height: _attributes.height,
          },
          ...(_attributes.code && { embedCode: _attributes.code }),
          mediaType: _attributes.mediaType,
        },
        _id: atomicId,
      }
      setEmbed(_entity)

      // if online, save details of embedded data
    }
  }, [graphRes.data])
  const { gray } = colors

  return (
    <View p="medium" alignItems="center" backgroundColor={gray[6]}>
      <Text variant="uiTextSmall" color="text.2">
        unable to load media
      </Text>
    </View>
  )
}
