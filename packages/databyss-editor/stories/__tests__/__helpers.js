import { jsx } from 'slate-hyperscript'
import { Text } from 'slate'
import ReactDOMServer from 'react-dom/server'

export const matchExpectedJson = (expectedJSX, actualString) => {
  const expectedString = ReactDOMServer.renderToStaticMarkup(expectedJSX)

  const expected = toSlateJson(expectedString)

  const actual = toSlateJson(actualString)

  expect(actual).to.deep.equal(expected)
}

const serialize = node => {
  if (Text.isText(node)) {
    let _text = node.text
    // we must follow the hierarchy of bold > italic > location
    if (node.location) {
      _text = `<location>${_text}</location>`
    }
    if (node.italic) {
      _text = `<italic>${_text}</italic>`
    }
    if (node.bold) {
      _text = `<bold>${_text}</bold>`
    }
    return _text
  }

  const children = node.children.map(n => serialize(n)).join('')
  switch (node.type) {
    case 'body':
      return `<body>${children}</body>`
    case 'ENTRY':
      return `<entity type=${node.type}>${children}</entity>`
    case 'SOURCE':
      return `<entity type=${node.type}>${children}</entity>`
    case 'TOPIC':
      return `<entity type=${node.type}>${children}</entity>`
    default:
      return children
  }
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
    case 'ENTITY':
      const type = el.getAttribute('type')
      return jsx('element', { type, isBlock: true }, children)
    case 'BOLD':
      return jsx('text', { bold: true }, children)
    case 'ITALIC':
      return jsx('text', { italic: true }, children)
    case 'LOCATION':
      return jsx('text', { location: true }, children)

    default:
      return el.textContent
  }
}

// converts slate state to a JSX string
export const slateToJSXString = slateState => {
  const editor = {
    type: 'body',
    children: slateState,
  }
  const doc = new DOMParser().parseFromString(serialize(editor), 'text/html')

  return `<body>${doc.body.innerHTML}</body>`
}

// converts JSX to Slate JSON value
export const toSlateJson = string => {
  const document = new DOMParser().parseFromString(string, 'text/html')
  return deserialize(document.body)
}
