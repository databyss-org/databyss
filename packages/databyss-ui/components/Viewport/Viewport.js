import React from 'react'
import { View } from '@databyss-org/ui/primitives'
import { Global } from '@emotion/core'

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
    <Global
      styles={{
        body: {
          overflow: 'hidden',
        },
      }}
    />
    {children}
  </View>
)

export default Viewport
