export const sanitizeEditorChildren = children =>
  children.map(node => ({
    type: node.type,
    children: node.children.map(c => {
      const _textNode = { text: c.text }
      if (c.bold) {
        _textNode.bold = true
      }
      if (c.italic) {
        _textNode.italic = true
      }
      if (c.location) {
        _textNode.location = true
      }

      return _textNode
    }),
  }))
