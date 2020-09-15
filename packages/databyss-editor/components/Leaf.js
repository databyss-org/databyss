import React from 'react'
import colors from '@databyss-org/ui/theming/colors'

const Leaf = ({ attributes, children, leaf }) => {
  const { blue, gray, orange } = colors

  let _children = children

  if (leaf.italic) {
    _children = <em>{_children}</em>
  }

  if (leaf.bold) {
    _children = <strong>{_children}</strong>
  }

  if (leaf.location) {
    _children = <span style={{ color: gray[4] }}>{_children}</span>
  }

  if (leaf.url) {
    _children = (
      <a
        onClick={() => {
          // validate url
          let _url = leaf.url
          if (
            !(_url.indexOf('http://') === 0 || _url.indexOf('https://') === 0)
          ) {
            _url = `http://${_url}`
          }
          window.open(_url, '_blank')
        }}
        href={leaf.url}
        style={{
          color: blue[2],
          cursor: 'pointer',
        }}
      >
        {_children}
      </a>
    )
  }

  return (
    <span
      {...attributes}
      style={{ backgroundColor: leaf.highlight && orange[3] }}
    >
      {_children}
    </span>
  )
}

export default Leaf
