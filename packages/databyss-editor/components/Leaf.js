import React from 'react'
import { View, Text } from '@databyss-org/ui/primitives'

const Leaf = ({ attributes, children, leaf }) => {
  let _children = React.cloneElement(children)

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

  if (leaf.type === 'spacer') {
    return (
      <Text display="inline" {...attributes} variant="bodyHeader">
        {_children}
      </Text>
    )
  }

  return (
    <View display="inline" {...attributes}>
      {_children}
    </View>
  )
}

export default Leaf
