import React from 'react'
import colors from '@databyss-org/ui/theming/colors'

const { blue, gray, orange, red } = colors

export const LinkLeaf = ({ _children }) => {
  return (
    <span
      // onClick={() => onNavigationClick({ id: leaf.atomicId })}
      style={{
        color: blue[1],
        caretColor: 'black',
        // cursor: 'pointer',
      }}
    >
      {_children}
    </span>
  )
}
