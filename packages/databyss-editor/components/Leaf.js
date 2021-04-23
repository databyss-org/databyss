/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react'
import colors from '@databyss-org/ui/theming/colors'

// check for email addresses
const _emailRegEx = new RegExp(
  /\b([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)\b/,
  'gi'
)

const Leaf = ({ attributes, children, leaf, readOnly, onInlineClick }) => {
  const { blue, gray, orange, red } = colors

  let _children = children
  // INLINE REFACTOR

  if (leaf.inlineAtomicMenu) {
    _children = (
      <span
        id="inline-atomic"
        style={{
          minWidth: '150px',
          display: 'inline-block',
          backgroundColor: gray[6],
          borderRadius: '3px',
          //    padding: '3px',
        }}
      >
        {_children}
      </span>
    )
  }

  if (leaf.inlineTopic || leaf.inlineCitation) {
    _children = (
      <span
        onClick={() =>
          onInlineClick({ atomicType: 'TOPIC', id: leaf.atomicId })
        }
        style={{
          color: red[1],
          caretColor: 'black',
          cursor: 'pointer',
        }}
      >
        {_children}
      </span>
    )
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
      style={{ backgroundColor: leaf.highlight && orange[3] }}
    >
      {_children}
    </span>
  )
}

export default Leaf
