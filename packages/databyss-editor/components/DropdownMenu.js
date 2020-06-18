import React from 'react'
import styledCss from '@styled-system/css'
import theme, { borderRadius } from '@databyss-org/ui/theming/theme'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { View, List } from '@databyss-org/ui/primitives'

const _css = position => ({
  padding: 'small',
  backgroundColor: 'background.0',
  zIndex: 1,
  position: 'absolute',
  transition: `${theme.timing.quick}ms ease`,
  borderRadius,
  ...position,
})

const DropdownMenu = ({ children, position = { top: 0, left: 0 } }) => (
  <View
    // maxWidth="500px"
    minWidth="200px"
    // minHeight="32px"
    shadowVariant="modal"
    css={styledCss(_css({ top: position.top, left: position.left }))}
  >
    <List verticalItemPadding={1} horizontalItemPadding={1}>
      {children}
    </List>
  </View>
)

export default DropdownMenu
