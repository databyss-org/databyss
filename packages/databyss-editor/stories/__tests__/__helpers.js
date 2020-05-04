import { jsx } from 'slate-hyperscript'
import ReactDOMServer from 'react-dom/server'
import { isAtomicInlineType } from './../../lib/util'

import { Editor } from 'slate'

// export const toSlateJson = hyperscript => {
//   const editor = new Editor()
//   editor.setValue(hyperscript)
//   return editor.value.toJSON()
// }

export const matchExpectedJson = expectedJson => $actual => {
  expect(JSON.parse($actual.text())).to.deep.equal(expectedJson)
}

export const deserialize = el => {
  if (el.nodeType === 3) {
    return el.textContent
  } else if (el.nodeType !== 1) {
    return null
  }

  const children = Array.from(el.childNodes).map(deserialize)
  switch (el.nodeName) {
    case 'BODY':
      return jsx('fragment', {}, children)

    case 'BLOCKQUOTE':
      return jsx('element', { type: 'stuff' }, children)
    case 'P':
      return jsx('element', { type: 'paragraph' }, children)
    case 'ENTITY':
      const type = el.getAttribute('type')
      if (isAtomicInlineType(type)) {
        return jsx(
          'text',
          {
            blockType: type,
            isBlock: true,
            // _id: el.getAttribute('blockId'),
            // entityId: el.getAttribute('entityId'),
          },
          el.textContent
        )
      } else {
        return jsx(
          'element',
          {
            blockType: type,
            isBlock: true,
            // _id: el.getAttribute('blockid'),
            // entityId: el.getAttribute('entityId'),
          },
          children
        )
      }
    case 'BOLD':
      return jsx('text', { bold: true, type: 'bold' }, children)
    default:
      return el.textContent
  }
}

export const toSlateJson = value => {
  const _string = ReactDOMServer.renderToStaticMarkup(value)
  const document = new DOMParser().parseFromString(_string, 'text/html')

  console.log(document)
  console.log(deserialize(document.body))
}
