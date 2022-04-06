/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react'
import colors from '@databyss-org/ui/theming/colors'
import { urlSafeName } from '@databyss-org/services/lib/util'
import { EditorEmbedMedia, EmbedMedia } from './EmbedMedia'
import { Link } from './Link'
import { getAccountFromLocation } from '../../databyss-services/session/utils'

// check for email addresses
const _emailRegEx = new RegExp(
  /\b([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)\b/,
  'gi'
)

export const Leaf = ({
  attributes,
  children,
  leaf,
  readOnly,
  onInlineClick,
}) => {
  const { blue, gray, orange, inlineTopic, inlineSource } = colors

  let _children = children

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

  if (leaf.embed) {
    _children = readOnly ? (
      <EmbedMedia
        attributes={attributes}
        _children={_children}
        _element={leaf}
        onInlineClick={onInlineClick}
      />
    ) : (
      <EditorEmbedMedia
        attributes={attributes}
        _children={_children}
        _element={leaf}
        onInlineClick={onInlineClick}
      />
    )
  }

  if (leaf.inlineEmbedInput) {
    _children = (
      <code
        id="inline-embed-input"
        style={{
          display: 'block',
          backgroundColor: gray[6],
          borderRadius: '3px',
          //    padding: '3px',
        }}
      >
        {_children}
      </code>
    )
  }

  const _groupId = getAccountFromLocation(true)

  if (leaf.inlineTopic) {
    _children = (
      <a
        href={`/${_groupId}/topics/${leaf.atomicId}/${urlSafeName(leaf.text)}`}
        onClick={(evt) => {
          evt.preventDefault()
          onInlineClick({
            atomicType: 'TOPIC',
            id: leaf.atomicId,
            name: leaf.text,
          })
        }}
        style={{
          color: inlineTopic,
          caretColor: 'black',
          cursor: 'pointer',
          textDecoration: 'none',
        }}
      >
        {_children}
      </a>
    )
  }

  if (leaf.link) {
    _children = (
      <Link
        _children={_children}
        atomicId={leaf.atomicId}
        readOnly={readOnly}
        text={leaf.text}
      />
    )
  }

  if (leaf.inlineCitation) {
    _children = (
      <a
        href={`/${_groupId}/sources/${leaf.atomicId}/${urlSafeName(leaf.text)}`}
        onClick={(evt) => {
          evt.preventDefault()
          onInlineClick({
            atomicType: 'SOURCE',
            id: leaf.atomicId,
            name: leaf.text,
          })
        }}
        style={{
          color: inlineSource,
          caretColor: 'black',
          cursor: 'pointer',
          textDecoration: 'none',
        }}
      >
        {_children}
      </a>
    )
  }

  if (leaf.inlineLinkInput) {
    _children = (
      <span
        id="inline-link-input"
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
