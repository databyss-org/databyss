import React from 'react'
import { View, Text } from '@databyss-org/ui/primitives'
import { pxUnits } from '../../theming/views'

const Separator = ({ spacing, color, secondary, label, lineWidth = 1 }) => (
  <View my={spacing} px={secondary ? 'small' : 'none'}>
    {lineWidth > 0 ? (
      <View
        height={1}
        borderColor={secondary ? 'gray.7' : color}
        borderTopWidth={pxUnits(lineWidth)}
        borderStyle="solid"
        width="100%"
      />
    ) : null}
    {label && (
      <View px="small" pt="small">
        <Text variant="uiTextHeading" color="text.3" opacity={1}>
          {label}
        </Text>
      </View>
    )}
  </View>
)

Separator.defaultProps = {
  spacing: 'tiny',
  color: 'border.3',
}

export default Separator
