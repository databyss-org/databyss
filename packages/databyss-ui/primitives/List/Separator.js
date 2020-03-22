import React from 'react'
import { View } from '@databyss-org/ui/primitives'
import { pxUnits } from '../../theming/views'

const Separator = ({ spacing, color }) => (
  <View
    height={1}
    borderColor={color}
    borderTopWidth={pxUnits(1)}
    borderStyle="solid"
    paddingTop="none"
    paddingBottom="none"
    paddingLeft="none"
    paddingRight="none"
    width="100%"
    marginTop={spacing}
    marginBottom={spacing}
  />
)

Separator.defaultProps = {
  spacing: 'none',
  color: 'border.2',
}

export default Separator
