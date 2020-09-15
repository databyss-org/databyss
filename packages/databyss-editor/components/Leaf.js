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
            // do something here
          }
          window.open(_url, '_blank')
        }}
        href={leaf.url}
        style={{
          color: 'blue',
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
      style={{ backgroundColor: leaf.highlight && '#F7C96E' }}
    >
      {_children}
    </span>
  )
}

export default Leaf
