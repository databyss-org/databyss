import Html from 'slate-html-serializer'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import xss from 'xss'
import uuid from './uuid'

const rules = [
  {
    serialize: (obj, children) => {
      if (obj.object === 'mark') {
        switch (obj.type) {
          case 'bold':
            return <strong data-serializer-key={uuid}>{children}</strong>
          case 'italic':
            return <em data-serializer-key={uuid}>{children}</em>
          // issue #116
          case 'location':
            return <span data-serializer-key={uuid}>{children}</span>
          default:
            return children
        }
      }
      if (obj.object === 'inline' || obj.object === 'block') {
        return <React.Fragment>{children}</React.Fragment>
      }
      return undefined
    },
  },
]

const serializer = new Html({ rules })
export default serializer

export const serializeNodeToHtml = node => {
  const children = serializer.serializeNode(node)
  const html = renderToStaticMarkup(<body>{children}</body>)
  return html.slice(6, -7)
}

function getKey(html) {
  const template = document.createElement('template')
  const _html = html.trim()
  template.innerHTML = _html
  const el = template.content.firstChild
  if (el) {
    if (el.dataset) return el.dataset.serializerKey
  }
  return null
}

const WHITELIST = ['strong', 'em', 'span']

export const sanitizer = text => {
  const list = []
  const _text = xss(text, {
    whiteList: [],
    stripIgnoreTag: false,
    onTag: (tag, html, option) => {
      // check if tag is in whitelist
      if (WHITELIST.findIndex(t => tag === t) > -1) {
        // get the uuid
        const el = getKey(html)

        // closing tag logic
        const _index = list.findIndex(t => t === tag)
        if (option.isClosing && _index > -1) {
          // tag is found
          // remove tag from running list
          list.splice(_index, 1)
          return `</${tag}>`
        }

        // opening tag logic
        if (el === uuid && !option.isClosing) {
          // add tag to list
          list.push(tag)
          return `<${tag}>`
        }
      }
      return null
    },
  })
  return _text
}
