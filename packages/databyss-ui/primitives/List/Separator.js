import React from 'react'
import { View, Text } from '@databyss-org/ui/primitives'
import { pxUnits } from '../../theming/views'

const Separator = ({ spacing, color, secondary, label }) => (
  <View my={spacing} px={secondary ? 'small' : 'none'}>
    <View
      height={1}
      borderColor={secondary ? 'gray.7' : color}
      borderTopWidth={pxUnits(1)}
      borderStyle="solid"
      width="100%"
    />
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
