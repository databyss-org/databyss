import React from 'react'
import { View } from '@databyss-org/ui/primitives'
import colors from '@databyss-org/ui/theming/colors'
import { MediaTypes } from '@databyss-org/services/interfaces/Block'

const { gray } = colors
export const IframeComponent = ({ query, src, height, width, mediaType }) =>
  mediaType === MediaTypes.HTML ? (
    <View backgroundColor={gray[6]}>
      <iframe
        id={query}
        title={query}
        srcDoc={src}
        width={width}
        height={height}
        // border="0px"
        frameBorder="0px"
      />
    </View>
  ) : (
    <View p="small">
      <iframe
        seamless
        id={query}
        title={query}
        src={src}
        // border="0px"
        frameBorder="0px"
        height={height}
        width={width}
      />
    </View>
  )
