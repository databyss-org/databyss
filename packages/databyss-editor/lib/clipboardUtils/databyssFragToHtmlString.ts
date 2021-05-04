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
      textValue: Node.string(_slateNode),
      ranges: slateRangesToStateRanges(_slateNode),
    },
    type: BlockType.Entry,
    _id: uid(),
  }
  return _block
}

const TEXT_TAGS = {
  SPAN: (el) => {
    let _style = {}
    // checks if span and bold
    if (el?.style?.fontWeight > 600) {
      _style = {
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
  P: () => ({ newLine: true }),
}

const ELEMENT_TAGS = {
  DIV: (el) => {
    if (el?.style?.fontStyle === 'italic') {
      return { type: 'ENTRY', _meta: ['italic'] }
    }
    if (el?.style?.fontWeight > 600) {
      return { type: 'ENTRY', _meta: ['bold'] }
    }
    return { type: 'ENTRY' }
  },
  BLOCKQUOTE: () => ({ type: 'ENTRY' }),
  LI: () => ({ type: 'ENTRY' }),
  OL: () => ({ type: 'ENTRY' }),
  P: () => ({ type: 'ENTRY' }),
  PRE: () => ({ type: 'ENTRY' }),
  UL: () => ({ type: 'ENTRY' }),
  H1: () => ({ type: 'ENTRY', _meta: ['bold'] }),
  H2: () => ({ type: 'ENTRY', _meta: ['bold'] }),
  H3: () => ({ type: 'ENTRY', _meta: ['bold'] }),
  H4: () => ({ type: 'ENTRY', _meta: ['bold'] }),
  H5: () => ({ type: 'ENTRY', _meta: ['bold'] }),
  H6: () => ({ type: 'ENTRY', _meta: ['bold'] }),
}

export const deserialize = (el) => {
  if (el.nodeType === 3) {
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
  const children = Array.from(parent.childNodes).map(deserialize).flat()

  if (el.nodeName === 'BODY') {
    return jsx('fragment', {}, children)
  }

  if (ELEMENT_TAGS[nodeName]) {
    let _children = children
    const attrs = ELEMENT_TAGS[nodeName](el)
    // apply style to entire node
    if (attrs._meta) {
      const _attrs = {}
      attrs._meta.forEach((a) => {
        _attrs[a] = true
      })
      // check if children consist of string
      if (_children.length === 1 && typeof _children[0] === 'string') {
        return children.map((child) => jsx('text', _attrs, child))
      }
      // apply style to all children
      _children = children.map((c) => {
        let _child = c
        // check to see if string
        if (typeof c === 'string') {
          _child = { text: c, ..._attrs }
        } else {
          _child = { ...c, ..._attrs }
        }
        return _child
      })
    }
    return jsx('element', attrs, _children)
  }

  if (TEXT_TAGS[nodeName]) {
    const attrs = TEXT_TAGS[nodeName](el)
    return children.map((child) => jsx('text', attrs, child))
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
      const _children = curr.children as Element[]
      // do not allow empty nodes
      if (!_children.length) {
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

  // flatten nested children, some children may have {type: 'ENTRY'}
  let _normalized: Node[] = []
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

export const htmlToDatabyssFrag = (html: string): Block[] => {
  const parsed = new DOMParser().parseFromString(html, 'text/html')

  console.log(parsed.body)

  const fragment: Node[] = deserialize(parsed.body)
  const _databysFragment = formatFragment(fragment)
  return _databysFragment
}
