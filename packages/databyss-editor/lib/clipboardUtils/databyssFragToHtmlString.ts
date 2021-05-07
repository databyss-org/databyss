import { jsx } from 'slate-hyperscript'
import {
  Node,
  Element,
  Text,
  createEditor,
  Transforms,
} from '@databyss-org/slate'
import { Block, BlockType } from '@databyss-org/services/interfaces'
import sanitizeHtml from 'sanitize-html'
import { toJSON } from 'cssjson'
import { slateRangesToStateRanges } from '../slateUtils'
import { uid } from '../../../databyss-data/lib/uid'
import splitTextAtOffset from './splitTextAtOffset'

const normalizeSlateNode = (block: Node): Block => {
  const editor = createEditor()
  Transforms.insertNodes(editor, block)

  const _slateNode = editor.children[0]

  const _block = {
    text: {
      // REMOVE EXTRA WHITESPACE
      textValue: Node.string(_slateNode),
      ranges: slateRangesToStateRanges(_slateNode),
    },
    type: BlockType.Entry,
    _id: uid(),
  }
  return _block
}

/**
 *
 * @param block if multiple \n\n split text into multiple entries
 */
const splitFragAtBreaks = (block: Block): Block[] => {
  const _textArray = block.text.textValue.split('\n\n')
  if (_textArray.length === 1) {
    return [block]
  }
  const _blocks: any[] = []
  let _afterText = block.text
  _textArray.forEach((t) => {
    const _offset = t.length
    const { before, after } = splitTextAtOffset({
      text: _afterText,
      offset: _offset,
    })
    if (before.textValue.trim().length) {
      _blocks.push({
        type: BlockType.Entry,
        text: before,
        _id: uid(),
      })
    }

    // trim after block to remove double \n
    const _after = splitTextAtOffset({
      text: after,
      offset: 2,
    }).after
    _afterText = _after
  })
  return _blocks
}

const newLineElements = {
  // SPAN: true,
  P: true,
  DIV: true,
  BLOCKQUOTE: true,
  LI: true,
  OL: true,
  PRE: true,
  UL: true,
  H1: true,
  H2: true,
  H3: true,
  H4: true,
  H5: true,
  H6: true,
  // TESTING THESE
  EM: true,
  B: true,
  A: true,
}

const isChildNewLineEl = (el) => {
  // do not allow new line on empty element
  if (!el?.innerText.length) {
    return true
  }

  // check child element to see if content exists
  if (el?.children?.length === 1) {
    if (newLineElements[el.children[0].tagName]) {
      return true
    }
  }
  return false
}

const styleContainer = (el) => {
  let _style: any = { ...(el.hasAttribute('break') && { newLine: true }) }

  // checks if span and bold
  if (el.hasAttribute('bold')) {
    _style = {
      ..._style,
      bold: true,
    }
  }
  // checks if span and italic
  if (el.hasAttribute('italic')) {
    _style = {
      ..._style,
      italic: true,
    }
  }

  return _style
}

const TEXT_TAGS = {
  BOLDITALIC: () => ({ bold: true, italic: true }),
  HEADER: () => ({ bold: true, newLine: true }),
  SPAN: styleContainer,
  EM: (el) => ({
    italic: true,
    ...(el.hasAttribute('break') && { newLine: true }),
  }),
  I: (el) => ({
    italic: true,
    ...(el.hasAttribute('break') && { newLine: true }),
  }),
  STRONG: (el) => ({
    bold: true,
    ...(el.hasAttribute('break') && { newLine: true }),
  }),
  P: (el) => {
    let _attributes = {}
    if (el.hasAttribute('break')) {
      _attributes = {
        ..._attributes,
        newLine: true,
      }
    }
    if (el.hasAttribute('indent')) {
      _attributes = {
        ..._attributes,
        indent: true,
      }
    }

    return _attributes
  },
  B: (el, isGoogleDoc) => {
    if (!isGoogleDoc) {
      return { bold: true, ...(el.hasAttribute('break') && { newLine: true }) }
    }
    return { ...(el.hasAttribute('break') && { newLine: true }) }
  },
  // NEW LINE
  DIV: styleContainer,
  BLOCKQUOTE: () => ({ newLine: true }),
  // TODO: ADD BULLET
  LI: () => ({ newLine: true }),
  OL: () => ({ newLine: true }),
  PRE: () => ({ newLine: true }),
  UL: () => ({ newLine: true }),
  H1: (el) => {
    if (isChildNewLineEl(el)) {
      return { bold: true }
    }
    return { newLine: true, bold: true }
  },
  H2: (el) => {
    if (isChildNewLineEl(el)) {
      return { bold: true }
    }
    return { newLine: true, bold: true }
  },
  H3: (el) => {
    if (isChildNewLineEl(el)) {
      return { bold: true }
    }
    return { newLine: true, bold: true }
  },
  H4: (el) => {
    if (isChildNewLineEl(el)) {
      return { bold: true }
    }
    return { newLine: true, bold: true }
  },
  H5: (el) => {
    if (isChildNewLineEl(el)) {
      return { bold: true }
    }
    return { newLine: true, bold: true }
  },
  H6: (el) => {
    if (isChildNewLineEl(el)) {
      return { bold: true }
    }
    return { newLine: true, bold: true }
  },
  BR: () => ({}),
}

export const deserialize = ({
  el,
  isGoogleDoc,
}: {
  el: HTMLElement | any
  isGoogleDoc?: boolean
}) => {
  if (el.nodeType === 3) {
    console.log('RETURN TEXT', `"${el.textContent}"`)
    if (el.textContent === `\n`) {
      return null
    }
    // if node is text type and only whitespace, do not allow
    // if (el.textContent.length && !el.textContent.trim().length) {
    //   return null
    // }
    return el.textContent
  } else if (el.nodeType !== 1) {
    return null
  } else if (el.nodeName === 'BR') {
    console.log(el.nodeName)
    return '\n'
  }

  const { nodeName } = el
  let parent = el

  if (
    nodeName === 'PRE' &&
    el.childNodes[0] &&
    el.childNodes[0].nodeName === 'CODE'
  ) {
    parent = el.childNodes[0]
  }
  // console.log('BEFORE DESERIALIZE', parent.childNodes)
  const children = Array.from(parent.childNodes)
    .map((e) => deserialize({ el: e, isGoogleDoc }))
    .flat()
    .filter((c) => !!c)

  // console.log('children', children)
  if (el.nodeName === 'BODY') {
    return jsx('fragment', {}, children)
  }

  if (TEXT_TAGS[nodeName]) {
    let _children = children
    const attrs = TEXT_TAGS[nodeName](el, isGoogleDoc)
    // append \n to text
    if (attrs?.newLine) {
      console.log(attrs?.indent)
      const _indent = attrs?.indent ? '\t' : ''
      delete attrs.newLine
      if (!_children.length) {
        // const _str = parent.firstChild.nodeValue
        // if empty node add new line
        if (parent.innerText.length) {
          const _str = parent?.firstChild?.nodeValue
          // console.log('INNER TEXT', _str.charCodeAt(0))
          const _nbsp = _str.charCodeAt(0) === 32 || _str.charCodeAt(0) === 160
          const _text = _nbsp ? ' ' : `${_indent}\n`
          return { text: _text }
        }
        return { text: `${_indent}` }
      }
      _children = _children.map((c: Text) => {
        let _textNode = {}

        // only append a new line to the end of text
        if (typeof c === 'string') {
          _textNode = {
            text: `${_indent}${c}`,
          }
        } else {
          _textNode = {
            ...c,
            text: `${_indent}${c.text}`,
          }
        }
        return _textNode
      })
      // add new line to end of node
      _children[_children.length - 1] = {
        ..._children[_children.length - 1],
        text: `${_children[_children.length - 1].text}\n`,
      }
    }

    return _children.map((child) => jsx('text', attrs, child))
  }

  return children
}

/**
 *
 * @param frag
 * cleans up slate fragment in order to have top level {type: 'ENTRY' }
 */
const sanatizeFrag = (frag: Node[]): Node[] =>
  frag.reduce((acc: Node[], curr: Node) => {
    if (curr.type === 'ENTRY' && curr?.children) {
      const _children = curr.children as Text[]
      // do not allow empty nodes
      if (
        !_children.length ||
        // if no text exist, remove node
        !_children.filter((c) => !!c?.text.trim().length).length
      ) {
        return acc
      }

      acc.push(curr)
      return acc
    }

    // if top level not tagged as Entry, insert into a node

    // if only text on node is new line, remove node
    const _curr = curr as Text
    if (_curr?.text.length === 1 && curr.text === '\n') {
      return acc
    }

    // create new element
    const _element: Element = {
      type: BlockType.Entry,
      children: [curr],
    }
    acc.push(_element)

    return acc
  }, [] as Node[])

/**
 *
 * @param frag Slate Frag
 * clean up slate frag and convert to databyss fragment
 */
const formatFragment = (frag: Node[]): Block[] => {
  let _frag = frag

  console.log(frag)

  // if fragment only contains text nodes, wrap in a Node {type: 'ENTRY'}
  if (!frag.filter((b) => b.type).length) {
    _frag = [
      {
        type: BlockType.Entry,
        children: frag,
      },
    ]
  }

  const _sanatizedFrag = sanatizeFrag(_frag)

  let _normalized: Node[] = []

  // flatten nested children, some children may have {type: 'ENTRY'}
  _sanatizedFrag.forEach((n: Node) => {
    const _n = n as Element
    // check if children have a type property
    if (_n?.children.filter((n) => n?.type).length) {
      // children contain nested entries, flatten node and sanatize
      const _tempChildren = _n.children
        .flatMap((n) => n.children)
        .filter((n) => !!n) as Node[]

      const _newNode = sanatizeFrag(_tempChildren)
      _newNode.forEach((_nn) => _normalized.push(_nn))

      return
    }
    _normalized.push(n)
  })

  _normalized = sanatizeFrag(_normalized)

  let _databyssFrag = _normalized.map((block) => normalizeSlateNode(block))

  // split into mulitple blocks if two `\n` exist in a row
  _databyssFrag = splitFragAtBreaks(_databyssFrag[0])

  return _databyssFrag
}

const isGooglePaste = (body: HTMLElement): boolean => {
  const _id: string = body?.children?.[0]?.id

  if (_id?.search('docs-internal') > -1) {
    return true
  }
  return false
}

const containerSanitizer = (tagName, attribs) => {
  let _isTab
  if (attribs?.style) {
    const _css = toJSON(`body {${attribs.style}}`)?.children?.body?.attributes

    // console.log('CSS STYLE', attribs)
    // check if italic
    const _fontStyle = _css?.['font-style']
    const _fontWeight: string = _css?.['font-weight']
    const _textIndent = _css?.['text-indent']
    _isTab = _textIndent && parseInt(_textIndent.slice(0, -2), 10) > 0

    // console.log('TEXT INDENT', _isTab)
    const _isItalic = _fontStyle === 'italic'
    const _isBold = _fontWeight && parseInt(_fontWeight, 10) > 600
    if (_isItalic && _isBold) {
      return {
        tagName: 'span',
        attribs: {
          bold: true,
          italic: true,
          ...(!!attribs.break && { break: true }),
        },
      }
    }
    if (_isItalic) {
      return {
        tagName: 'em',
        attribs: {
          ...(!!attribs.break && { break: true }),
        },
      }
    }
    if (_isBold) {
      return {
        tagName: 'strong',
        ...(!!attribs.break && { break: true }),
      }
    }
  }

  return {
    tagName,
    attribs: {
      ...(!!attribs?.break && { break: true }),
      ...(!!_isTab && { indent: true }),
    },
  }
}

const textTagStyle = (tagName, attribs) => {
  return {
    tagName,
    attribs: {
      ...(!!attribs?.break && { break: true }),
    },
  }
}

// header function for sanatize
const sanatizeHeader = () => ({
  tagName: 'header',
  attribs: {
    break: true,
  },
})

const _sanitizeHtml = (html: string): string =>
  sanitizeHtml(html, {
    allowedTags: Object.keys(TEXT_TAGS).map((t) => t.toLocaleLowerCase()),
    // allowed attributes
    allowedAttributes: {
      '*': ['break', 'bold', 'italic', 'indent'],
    },
    // TRANSFORM TAG NAMES
    transformTags: {
      p: containerSanitizer,
      // links should come in as spans
      a: (tagName, attribs) => textTagStyle('span', attribs),
      b: textTagStyle,
      div: containerSanitizer,
      span: containerSanitizer,
      h1: sanatizeHeader,
      h2: sanatizeHeader,
      h3: sanatizeHeader,
      h4: sanatizeHeader,
      h5: sanatizeHeader,
    },
  })

export const htmlToDatabyssFrag = (html: string): Block[] => {
  console.log(html)
  let parsed = new DOMParser().parseFromString(html, 'text/html')
  console.log('before', parsed.body)
  const _isGoogle = isGooglePaste(parsed.body)

  const _body = (_isGoogle
    ? parsed.body.firstChild
    : parsed.body) as HTMLElement

  // add break property to all top level elements
  const children = _body.children
  for (let i = 0; i < children.length; i += 1) {
    const _child = children[i]

    if (newLineElements[_child.tagName]) {
      _child.setAttribute('break', 'true')
    }
  }
  // convert to custom tags
  const _sanitzedHtml = _sanitizeHtml(_body.outerHTML)

  parsed = new DOMParser().parseFromString(_sanitzedHtml, 'text/html')
  console.log('after', parsed.body)

  // console.log(parsed.body)

  const fragment: Node[] = deserialize({
    el: parsed.body,
    isGoogleDoc: _isGoogle,
  })
  const _databysFragment = formatFragment(fragment)
  return _databysFragment
}
