import React from 'react'
import { Text, View } from '@databyss-org/ui/primitives'

export { TextControls } from './Controls'
export { CaptionedView } from './Views'

export const Section = ({ children, title, variant, ...others }) => (
  <View mb="medium" {...others}>
    <View mb="small">
      <Text variant={variant} color="text.4">
        {title}
      </Text>
    </View>
    {children}
  </View>
)

Section.defaultProps = {
  variant: 'heading3',
}
