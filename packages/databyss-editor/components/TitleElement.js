import React from 'react'
import { View, Text } from '@databyss-org/ui'

export const TitleElement = ({ attributes, children }) => (
  <View
    position="relative"
    ml={process.env.FORCE_MOBILE ? 'none' : 'medium'}
    mb={!process.env.FORCE_MOBILE ? 'em' : 'none'}
    mt={process.env.FORCE_MOBILE ? 'em' : 'none'}
  >
    <Text
      {...attributes}
      variant="bodyHeading1"
      color="text.3"
      data-test-element="page-header"
      data-test-editor-element="true"
    >
      {children}
    </Text>
  </View>
)
