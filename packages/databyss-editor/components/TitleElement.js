import React from 'react'
import { View, Text, Icon } from '@databyss-org/ui'
import { UNTITLED_PAGE_NAME } from '@databyss-org/services/interfaces'
import PageSvg from '@databyss-org/ui/assets/page.svg'

export const TitleElement = ({ attributes, children, element, text }) => {
  const _text = text ?? element.children[0]?.text
  return (
    <View
      position="relative"
      ml={process.env.FORCE_MOBILE ? 'none' : 'medium'}
      mb={!process.env.FORCE_MOBILE ? 'em' : 'none'}
      mt={process.env.FORCE_MOBILE ? 'em' : 'large'}
    >
      <Icon
        position="absolute"
        left="mediumNegative"
        top="small"
        color="gray.5"
        sizeVariant="small"
      >
        <PageSvg />
      </Icon>
      {!_text?.length && (
        <View
          position="absolute"
          top="0"
          left="0"
          contentEditable="false"
          suppressContentEditableWarning
          css={{ pointerEvents: 'none' }}
        >
          <Text variant="bodyHeading1" color="text.3" opacity={text ? 1 : 0.5}>
            {UNTITLED_PAGE_NAME}
          </Text>
        </View>
      )}
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
}
