import React from 'react'

const Leaf = ({ attributes, children, leaf }) => {
  let _children = children

  if (leaf.italic) {
    _children = <em>{_children}</em>
  }

  if (leaf.bold) {
    _children = <strong>{_children}</strong>
  }

  if (leaf.location) {
    _children = <span style={{ color: '#A19A91' }}>{_children}</span>
    // _children = (
    //   <View {...attributes} color="text.3" display="inline" borderRadius={0}>
    //     {_children}
    //   </View>
    // )
  }

  return (
    <span
      {...attributes}
      style={{ backgroundColor: leaf.highlight && '#F7C96E' }}
    >
      {_children}
    </span>
    // <View
    //   display="inline"
    //   backgroundColor={leaf.highlight && 'orange.3'}
    //   {...attributes}
    // >
    //   {_children}
    // </View>
  )
}

export default Leaf
