import React from 'react'
import { View } from '@databyss-org/ui/primitives'

const Viewport = ({ children, isFullscreen, ...others }) => (
  <View paddingVariant="medium" {...others}>
    {children}
  </View>
)

export default Viewport
