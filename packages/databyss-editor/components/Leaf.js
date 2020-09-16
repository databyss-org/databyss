import React from 'react'
import colors from '@databyss-org/ui/theming/colors'

// check for email addresses
const _emailRegEx = new RegExp(
  /\b([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)\b/,
  'gi'
)

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
    console.log(leaf.url)
    let _formattedUrl = leaf.url
    const _isEmail = _formattedUrl.match(_emailRegEx)

    if (_isEmail) {
      // add email prefix
      _formattedUrl = `mailto:${_formattedUrl}`
    } else if (
      // validate url
      !(
        _formattedUrl.indexOf('http://') === 0 ||
        _formattedUrl.indexOf('https://') === 0
      )
    ) {
      _formattedUrl = `http://${_formattedUrl}`
    }

    console.log(_formattedUrl)
    _children = (
      <a
        onClick={() => window.open(_formattedUrl, '_blank')}
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
