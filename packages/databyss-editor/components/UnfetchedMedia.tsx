import React, { useEffect } from 'react'
import { View, Text } from '@databyss-org/ui/primitives'
import colors from '@databyss-org/ui/theming/colors'
import { setEmbed } from '@databyss-org/services/embeds/setEmbed'
import { useOpenGraph } from '@databyss-org/data/pouchdb/hooks/useOpenGraph'
import { BlockType, Embed } from '@databyss-org/services/interfaces/Block'

export const UnfetchedMedia = ({ atomicId, src, highlight }) => {
  //   const blocksRes = useBlocks(BlockType.Embed)
  const graphRes = useOpenGraph(src)

  useEffect(() => {
    // console.log('[UnfetchedMedia] graphdata', graphRes.data)
    if (graphRes.data) {
      const _attributes = graphRes.data

      if (_attributes?.mediaType) {
        const _entity: Embed = {
          type: BlockType.Embed,
          // remove atomic symbol
          text: { textValue: _attributes.title!, ranges: [] },
          detail: {
            title: _attributes.title,
            src: _attributes.src,
            mediaType: _attributes.mediaType,
            ...(_attributes.openGraphJson && {
              openGraphJson: _attributes.openGraphJson,
            }),
          },
          _id: atomicId,
        }
        setEmbed(_entity)
      }

      // if online, save details of embedded data
    }
  }, [graphRes.data])
  const { gray, orange } = colors

  return (
    <View
      p="medium"
      alignItems="center"
      backgroundColor={gray[6]}
      zIndex={1}
      position="relative"
      style={{
        border: 2,
        borderStyle: 'solid',
        borderColor: highlight ? orange[0] : `rgba(0,0,0,0.0)`,
      }}
    >
      <Text variant="uiTextSmall" color="text.2">
        Fetching media…
      </Text>
    </View>
  )
}
