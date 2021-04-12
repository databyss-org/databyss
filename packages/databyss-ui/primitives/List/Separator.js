import React from 'react'
import { View } from '@databyss-org/ui/primitives'
import { pxUnits } from '../../theming/views'

const Separator = ({ spacing, color, secondary }) => (
  <View my={spacing} px={secondary ? 'small' : 'none'}>
    <View
      height={1}
      borderColor={secondary ? 'gray.7' : color}
      borderTopWidth={pxUnits(1)}
      borderStyle="solid"
      width="100%"
    />
  </View>
)

Separator.defaultProps = {
  spacing: 'tiny',
  color: 'border.3',
}

export default Separator
