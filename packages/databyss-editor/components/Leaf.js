import React from 'react'
import { View } from '@databyss-org/ui/primitives'

const Leaf = ({ attributes, children, leaf }) => {
  let _children = children

  if (leaf.bold) {
    _children = <strong>{children}</strong>
  }

  if (leaf.italic) {
    _children = <em>{children}</em>
  }

  if (leaf.location) {
    _children = (
      <View
        {...attributes}
        borderBottom="1px dashed"
        borderColor="text.4"
        display="inline"
        borderRadius={0}
      >
        {_children}
      </View>
    )
  }

  return (
    <View display="inline" {...attributes}>
      {_children}
    </View>
  )
}

export default Leaf
