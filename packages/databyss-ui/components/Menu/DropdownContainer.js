import React, { forwardRef } from 'react'
import styledCss from '@styled-system/css'
import theme, { borderRadius } from '@databyss-org/ui/theming/theme'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { View, List } from '@databyss-org/ui/primitives'

const _css = (position, open) => ({
  backgroundColor: 'background.0',
  zIndex: 'menu',
  position: 'absolute',
  opacity: open ? 1 : 0,
  transition: `opacity ${theme.timing.quick}ms ease`,
  borderRadius,
  pointerEvents: open ? 'auto' : 'none',
  ...position,
})

const DropdownContainer = forwardRef(
  (
    {
      children,
      position,
      widthVariant,
      minHeight,
      maxWidth,
      open,
      verticalItemPadding,
      horizontalItemPadding,
      ...others
    },
    ref
  ) => (
    <View
      ref={ref}
      maxWidth={maxWidth}
      widthVariant={widthVariant}
      minHeight={minHeight}
      shadowVariant="modal"
      css={styledCss(
        _css(
          {
            top: position.top,
            left: position.left,
            right: position.right,
            bottom: position.bottom,
          },
          open
        )
      )}
      {...others}
    >
      <List
        horizontalItemPadding={horizontalItemPadding}
        verticalItemPadding={verticalItemPadding}
      >
        {children}
      </List>
    </View>
  )
)

DropdownContainer.defaultProps = {
  position: { top: 0 },
  widthVariant: 'dropdownMenuMedium',
  maxWidth: pxUnits(500),
}

export default DropdownContainer
