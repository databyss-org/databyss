import React from 'react'
import { View } from '@databyss-org/ui/primitives'

const Content = ({ children, ...others }) => (
  <View maxWidth="contentWidth" {...others}>
    {children}
  </View>
)

export default Content
