import React from 'react'
import { Text, View } from '@databyss-org/ui/primitives'

export { TextControls } from './Controls'

export const Section = ({ children, title, ...others }) => (
  <View mb="medium" {...others}>
    <View mb="small">
      <Text variant="heading3" color="text.4">
        {title}
      </Text>
    </View>
    {children}
  </View>
)
