import React from 'react'
import { View } from '@databyss-org/ui/primitives'
import { pxUnits } from '../../theming/views'

const Separator = ({ spacing }) => (
  <View
    height={1}
    borderColor="border.2"
    borderTopWidth={pxUnits(1)}
    borderStyle="solid"
    paddingTop="none"
    paddingBottom="none"
    paddingLeft="none"
    paddingRight="none"
    marginTop={spacing}
    marginBottom={spacing}
  />
)

Separator.defaultProps = {
  spacing: 'none',
}

export default Separator
