/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useEffect, useRef } from 'react'
import { urlSafeName } from '@databyss-org/services/lib/util'
import { highlightManager } from '@databyss-org/ui/hooks/search/useFindInPage'
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
  textOnly,
  theme,
}) => {
  const highlightRef = useRef(null)
  const {
    blue,
    highlight,
    inlineTopic,
    inlineSource,
    background,
  } = theme.colors

  useEffect(() => {
    if (!highlightRef.current) {
      return
    }
    highlightManager.addHighlightElement(highlightRef.current)
  }, [highlightRef.current])

  let _children = children

  if (leaf.inlineAtomicMenu) {
    _children = (
      <span
        id="inline-atomic"
        style={{
          minWidth: '150px',
          display: 'inline-block',
          backgroundColor: background[2],
          borderRadius: '3px',
          //    padding: '3px',
        }}
      >
        {_children}
      </span>
    )
  }

  if (leaf.embed) {
    if (textOnly) {
      _children = (
        <>
          [figure]{_children}
          <br />
        </>
      )
    } else {
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
  }

  if (leaf.inlineEmbedInput) {
    _children = (
      <code
        id="inline-embed-input"
        style={{
          display: 'block',
          backgroundColor: background[2],
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
          caretColor: theme.colors.text[0],
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
        theme={theme}
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
          caretColor: theme.colors.text[0],
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
          backgroundColor: background[2],
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
    _children = <span style={{ color: background[4] }}>{_children}</span>
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
        href={_formattedUrl}
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
      {...(leaf.highlight
        ? {
            style: {
              backgroundColor: highlight[0],
            },
            'data-find-highlight': true,
            ref: highlightRef,
          }
        : {})}
      {...attributes}
    >
      {_children}
    </span>
  )
}
