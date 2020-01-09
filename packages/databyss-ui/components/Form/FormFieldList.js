import React from 'react'
import { List } from '@databyss-org/ui/primitives'

export default ({ children, ...others }) => (
  <List verticalItemPadding="small" horizontalItemPadding="none" {...others}>
    {children}
  </List>
)
