import React from 'react'
import { View } from '@databyss-org/ui/primitives'

const Viewport = ({ children, ...others }) => (
  <View
    paddingVariant="medium"
    backgroundColor="pageBackground"
    height="100vh"
    alignItems="center"
    justifyContent="flex-start"
    overflowY="auto"
    {...others}
  >
    {children}
  </View>
)

export default Viewport
