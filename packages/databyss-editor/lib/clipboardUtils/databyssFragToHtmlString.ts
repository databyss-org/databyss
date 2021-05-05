import { jsx } from 'slate-hyperscript'
import {
  Node,
  Element,
  Text,
  createEditor,
  Transforms,
} from '@databyss-org/slate'
import { Block, BlockType } from '@databyss-org/services/interfaces'
import { slateRangesToStateRanges } from '../slateUtils'
import { uid } from '../../../databyss-data/lib/uid'

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

const newLineElements = {
  SPAN: true,
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

const TEXT_TAGS = {
  SPAN: (el) => {
    let _style: any = isChildNewLineEl(el) ? {} : { newLine: true }
    // checks if span and bold
    if (el?.style?.fontWeight > 600) {
      _style = {
        ..._style,
        bold: true,
      }
    }
    // checks if span and italic
    if (el?.style?.fontStyle === 'italic') {
      _style = {
        ..._style,
        italic: true,
      }
    }
    return _style
  },
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  STRONG: () => ({ bold: true }),
  P: (el) => {
    if (isChildNewLineEl(el)) {
      return {}
    }

    return { newLine: true }
  },
  B: (el, isGoogleDoc) => {
    if (!isGoogleDoc) {
      return { bold: true }
    }
    return {}
  },
  // NEW LINE
  DIV: (el) => {
    const _newLine = isChildNewLineEl(el) ? {} : { newLine: true }
    if (el?.style?.fontStyle === 'italic') {
      return { italic: true, ..._newLine }
    }
    if (el?.style?.fontWeight > 600) {
      return { bold: true, ..._newLine }
    }
    return _newLine
  },
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
}

export const deserialize = ({
  el,
  isGoogleDoc,
}: {
  el: HTMLElement | any
  isGoogleDoc?: boolean
}) => {
  if (el.nodeType === 3) {
    // if node is text type and only whitespace, do not allow
    if (el.textContent.length && !el.textContent.trim().length) {
      return null
    }
    return el.textContent
  } else if (el.nodeType !== 1) {
    return null
  } else if (el.nodeName === 'BR') {
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
  const children = Array.from(parent.childNodes)
    .map((e) => deserialize({ el: e, isGoogleDoc }))
    .flat()
    .filter((c) => !!c)

  if (el.nodeName === 'BODY') {
    return jsx('fragment', {}, children)
  }

  if (TEXT_TAGS[nodeName]) {
    let _children = children
    console.log(children)
    const attrs = TEXT_TAGS[nodeName](el, isGoogleDoc)
    // append \n to text
    if (attrs?.newLine) {
      delete attrs.newLine
      // if empty node add new line
      if (!_children.length) {
        return { text: '\n' }
      }
      _children = _children.map((c: Text) => {
        let _textNode = {}

        console.log(c)
        // only append a new line to the end of text
        if (typeof c === 'string') {
          _textNode = {
            text: `${c}`,
          }
        } else {
          _textNode = {
            ...c,
            text: `${c.text}`,
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

  const _databyssFrag = _normalized.map((block) => normalizeSlateNode(block))

  return _databyssFrag
}

const isGooglePaste = (body: HTMLElement): boolean => {
  const _id: string = body?.children?.[0]?.id

  if (_id?.search('docs-internal') > -1) {
    return true
  }
  return false
}

export const htmlToDatabyssFrag = (html: string): Block[] => {
  const parsed = new DOMParser().parseFromString(html, 'text/html')

  console.log(parsed.body)

  const _isGoogle = isGooglePaste(parsed.body)

  const fragment: Node[] = deserialize({
    el: parsed.body,
    isGoogleDoc: _isGoogle,
  })
  const _databysFragment = formatFragment(fragment)
  return _databysFragment
}
