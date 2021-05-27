import React from 'react'
import { View } from '@databyss-org/ui/primitives'

export const IframeComponent = ({ query, src, height, width }) => (
  <View p="small">
    <iframe
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
