import escapeHtml from 'escape-html'
import { Text } from 'slate'

export const serialize = (node) => {
  if (Text.isText(node)) {
    return escapeHtml(node.text)
  }

  const children = node.children.map((n) => serialize(n)).join('')
  switch (node.type) {
    case 'bold':
      return `<strong>${children}</strong>`
    case 'italic':
      return `<em>${children}</em>`
    default:
      return children
  }
}

export const atomicHTMLSerializer = (childrenArray) => {
  const _childrenText = childrenArray[0].children.map((c) => {
    if (!c.type) {
      return c
    }
    return { type: c.type, children: [{ text: c.text }] }
  })

  return serialize({ children: _childrenText })
}
