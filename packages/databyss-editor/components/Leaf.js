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
  }

  return (
    <span
      {...attributes}
      style={{ backgroundColor: leaf.highlight && '#F7C96E' }}
    >
      {_children}
    </span>
  )
}

export default Leaf
