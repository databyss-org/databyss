import React from 'react'
import styledCss from '@styled-system/css'
import theme, { borderRadius } from '@databyss-org/ui/theming/theme'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { View } from '@databyss-org/ui/primitives'

const _css = (position, open) => ({
  backgroundColor: 'background.0',
  zIndex: 1,
  position: 'absolute',
  opacity: open ? 1 : 0,
  transition: `${theme.timing.quick}ms ease`,
  borderRadius,
  ...position,
})

const DropdownMenu = ({
  children,
  position = { top: 0, left: 0 },
  minWidth = pxUnits(200),
  minHeight = pxUnits(32),
  maxWidth = pxUnits(500),
  open,
  ...others
}) => (
  <View
    maxWidth={maxWidth}
    minWidth={minWidth}
    minHeight={minHeight}
    shadowVariant="modal"
    css={styledCss(_css({ top: position.top, left: position.left }, open))}
    {...others}
  >
    {children}
  </View>
)

export default DropdownMenu
