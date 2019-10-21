import React, { forwardRef } from 'react'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { Grid, View } from '@databyss-org/ui/primitives'
import IS_NATIVE from '@databyss-org/ui/lib/isNative'

const EditorTooltip = forwardRef(({ children, ...others }, ref) => {
  if (IS_NATIVE) {
    throw new Error('Component not availablle in React Native')
  }

  const style = {
    paddingLeft: pxUnits(7),
    paddingRight: pxUnits(7),
    backgroundColor: 'background.6',
    zIndex: 1,
    pointerEvents: 'none',
    marginTop: pxUnits(-6),
    position: 'absolute',
    opacity: 0,
    transition: 'opacity 0.75s',
    borderRadius: pxUnits(5),
  }
  return (
    <View {...style} {...others} ref={ref}>
      <Grid singleRow columnGap={0} flexWrap="nowrap">
        {children}
      </Grid>
    </View>
  )
})

export default EditorTooltip
