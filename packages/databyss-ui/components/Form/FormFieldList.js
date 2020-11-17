import React from 'react'
import { List } from '@databyss-org/ui/primitives'

const FormFieldList = ({ children, ...others }) => (
  <List
    verticalItemPadding="small"
    horizontalItemPadding="none"
    removeBorderRadius={false}
    {...others}
  >
    {children}
  </List>
)

export default FormFieldList
