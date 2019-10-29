import React, { useEffect } from 'react'
import { Grid } from '@databyss-org/ui/primitives'

const EditorBlockMenuActions = ({ menuActionButtons, unmount }) => {
  useEffect(() => () => unmount(), [])
  return (
    <Grid singleRow columnGap="tiny">
      {menuActionButtons}
    </Grid>
  )
}

export default EditorBlockMenuActions
