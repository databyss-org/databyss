import React from 'react'
import { View, Text } from '@databyss-org/ui'
import { UNTITLED_PAGE_NAME } from '@databyss-org/services/interfaces'

export const TitleElement = ({ attributes, children, element }) => (
  <View position="relative" ml={process.env.FORCE_MOBILE ? 'none' : 'medium'}>
    {element.children.length === 1 && !element.children[0].text.length && (
      <View
        position="absolute"
        top="0"
        left="0"
        contentEditable="false"
        suppressContentEditableWarning
      >
        <Text variant="bodyHeading1" color="text.3" opacity={0.5}>
          {UNTITLED_PAGE_NAME}
        </Text>
      </View>
    )}
    <Text {...attributes} variant="bodyHeading1" color="text.3">
      {children}
    </Text>
  </View>
)
