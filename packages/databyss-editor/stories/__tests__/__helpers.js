export const sanitizeEditorChildren = children =>
  children.map(node => ({ type: node.type, children: node.children }))
