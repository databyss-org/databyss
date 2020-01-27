import React from 'react'
import { View } from '@databyss-org/ui/primitives'

const Viewport = ({ children, ...others }) => (
  <View
    paddingVariant="medium"
    backgroundColor="pageBackground"
    minHeight="100vh"
    alignItems="center"
    justifyContent="center"
    {...others}
  >
    {children}
  </View>
)

export default Viewport
