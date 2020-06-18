import React from 'react'
import styledCss from '@styled-system/css'
import theme, { borderRadius } from '@databyss-org/ui/theming/theme'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { View, List } from '@databyss-org/ui/primitives'

const _css = () => ({
  paddingLeft: 'small',
  paddingRight: 'small',
  backgroundColor: 'background.0',
  zIndex: 1,
  marginTop: pxUnits(-6),
  position: 'absolute',
  transition: `opacity ${theme.timing.quick}ms ease`,
  borderRadius,
})

const DropdownMenu = ({ children }) => (
  <View
    maxWidth="500px"
    minWidth="300px"
    minHeight="32px"
    shadowVariant="modal"
    css={styledCss(_css())}
  >
    <List verticalItemPadding={1} horizontalItemPadding={1}>
      {children}
    </List>
  </View>
)

export default DropdownMenu
