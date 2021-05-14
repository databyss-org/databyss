import React from 'react'
import colors from '@databyss-org/ui/theming/colors'

export const EmbedMedia = ({ _children, attributes, _element }) => {
  console.log('el', _element)
  const { gray } = colors

  return (
    <span {...attributes}>
      <span
        contentEditable={false}
        id="inline-embed-input"
        style={{
          display: 'block',
          backgroundColor: gray[6],
          borderRadius: '3px',
          //    padding: '3px',
        }}
      >
        {_element.character}
      </span>
      {_children}
    </span>
  )
}
// <div {...attributes}>
//   <div contentEditable={false}>testing</div>
//   {_children}
// </div>
