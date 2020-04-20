import React from 'react'
import { View } from '@databyss-org/ui/primitives'

const Leaf = ({ attributes, children, leaf }) => {
  let _children = children

  // console.log(children)
  // console.log(leaf)
  if (leaf.italic) {
    //  console.log(_children)
    _children = <em>{_children}</em>
  }

  if (leaf.bold) {
    _children = <strong>{_children}</strong>
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
