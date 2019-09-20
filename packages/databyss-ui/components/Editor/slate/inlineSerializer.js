import Html from 'slate-html-serializer'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'

const rules = [
  {
    serialize: (obj, children) => {
      if (obj.object === 'mark') {
        switch (obj.type) {
          case 'bold':
            return <strong>{children}</strong>
          case 'italic':
            return <em>{children}</em>
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
