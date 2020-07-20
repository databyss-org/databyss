import React from 'react'
import { View } from '@databyss-org/ui/primitives'

const Leaf = ({ attributes, children, leaf }) => {
  let _children = children

  if (leaf.italic) {
    _children = <em>{_children}</em>
  }

  if (leaf.bold) {
    _children = <strong>{_children}</strong>
  }

  if (leaf.location) {
    _children = (
      <View {...attributes} color="text.3" display="inline" borderRadius={0}>
        {_children}
      </View>
    )
  }

  return (
    <View
      display="inline"
      backgroundColor={leaf.highlight && 'orange.3'}
      {...attributes}
    >
      {_children}
    </View>
  )
}

export default Leaf
