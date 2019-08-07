import React from 'react'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { Text, View } from '@databyss-org/ui/primitives'
import MenuItem from './MenuItem'
import EditorEditor from './EditorEditor'

const EditorMenuAction = ({ action }) => {
  return (
    <Grid columnGap={0} mb={1}>
      <MenuItem item={action} />
    </Grid>
  )
}

export default EditorMenuAction
