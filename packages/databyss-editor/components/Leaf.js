import React from 'react'
import colors from '@databyss-org/ui/theming/colors'

// check for email addresses
const _emailRegEx = new RegExp(
  /\b([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)\b/,
  'gi'
)

const Leaf = ({ attributes, children, leaf, readOnly }) => {
  const { blue, gray, orange } = colors

  let _children = children

  // if line break exists without any character following, wrap it in a div, firefox ignores line breaks at the end of a string
  if (leaf.lineBreak) {
    // detect firefox browser
    if (navigator.userAgent.indexOf('Firefox') > -1) {
      // wrap hanging new line in a div
      _children = <div>{_children}</div>
    }
  }

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

    _children = (
      <a
        target="_blank"
        rel="noreferrer"
        href={leaf.url}
        style={{
          color: blue[2],
          cursor: 'pointer',
        }}
        {...(!readOnly
          ? {
              onClick: () => window.open(_formattedUrl, '_blank'),
            }
          : {})}
      >
        {_children}
      </a>
    )
  }

  return (
    <span
      {...attributes}
      style={{
        backgroundColor: leaf.highlight && orange[3],
      }}
    >
      {_children}
    </span>
  )
}

export default Leaf
