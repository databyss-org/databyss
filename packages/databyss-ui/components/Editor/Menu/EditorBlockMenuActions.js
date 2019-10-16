import React, { useState, useEffect } from 'react'
import Grid from '@databyss-org/ui/components/Grid/Grid'

const EditorBlockMenuActions = ({ menuActionButtons, unmount }) => {
  useEffect(() => {
    return () => unmount()
  }, [])
  return (
    <Grid singleRow columnGap="tiny">
      {menuActionButtons}
    </Grid>
  )
}

export default EditorBlockMenuActions
