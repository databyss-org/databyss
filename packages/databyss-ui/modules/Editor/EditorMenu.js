import React from 'react'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { View } from '@databyss-org/ui/primitives'
import MenuItem from './MenuItem'
import { menuAction } from './_helpers'

const EditorMenu = ({ data }) => {
  const action = menuAction(data.action)
  const menuItems = data.items.map((i, k) => {
    const item = menuAction(i)
    return <MenuItem item={item} key={k} />
  })

  return (
    <Grid columnGap={1} mb={2} alignItems="right">
      <View width={1 / 12}>
        <Grid columnGap={0} mb={1}>
          <MenuItem item={action} />
        </Grid>
      </View>
      <View width={9 / 12}>
        <Grid columnGap={1} mb={1}>
          {menuItems}
        </Grid>
      </View>
    </Grid>
  )
}

export default EditorMenu
