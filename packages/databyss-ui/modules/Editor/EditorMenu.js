import React from 'react'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { Text, View } from '@databyss-org/ui/primitives'
import EditorMenuAction from './EditorMenuAction'
import EditorMenuItem from './EditorMenuItem'

const EditorMenu = ({ menuItems, menuAction }) => {
  return (
    <Grid columnGap={1} mb={1} alignItems="right">
      <View width={1 / 12}>
        <EditorMenuAction action={menuAction} />
      </View>
      <View width={10 / 12}>
        <EditorMenuItem items={menuItems} />
      </View>
    </Grid>
  )
}

export default EditorMenu
