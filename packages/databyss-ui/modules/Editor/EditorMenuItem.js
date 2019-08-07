import React from 'react'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { Text, View } from '@databyss-org/ui/primitives'
import MenuItem from './MenuItem'
import EditorEditor from './EditorEditor'

const EditorMenuItem = ({ items }) => {
  const menuItems = items.map((i, k) => <MenuItem item={i} key={k} />)

  return (
    <Grid columnGap={1} mb={1}>
      {menuItems}
    </Grid>
  )
}

export default EditorMenuItem
