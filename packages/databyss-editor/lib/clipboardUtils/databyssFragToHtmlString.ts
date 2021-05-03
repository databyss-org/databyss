import { jsx } from 'slate-hyperscript'
import { Node, Element, Text } from '@databyss-org/slate'
import { Block, BlockType } from '@databyss-org/services/interfaces'
import { slateRangesToStateRanges } from '../slateUtils'
import { uid } from '../../../databyss-data/lib/uid'

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
  H1: () => ({ bold: true }),
  H2: () => ({ bold: true }),
  H3: () => ({ bold: true }),
  H4: () => ({ bold: true }),
  H5: () => ({ bold: true }),
  H6: () => ({ bold: true }),
}

const ELEMENT_TAGS = {
  BLOCKQUOTE: () => ({ type: 'ENTRY' }),
  LI: () => ({ type: 'ENTRY' }),
  OL: () => ({ type: 'ENTRY' }),
  P: () => ({ type: 'ENTRY' }),
  PRE: () => ({ type: 'ENTRY' }),
  UL: () => ({ type: 'ENTRY' }),
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
    const attrs = ELEMENT_TAGS[nodeName](el)
    return jsx('element', attrs, children)
  }

  if (TEXT_TAGS[nodeName]) {
    const attrs = TEXT_TAGS[nodeName](el)
    return children.map((child) => jsx('text', attrs, child))
  }

  return children
}

const formatFragment = (frag: Node[]): Block[] => {
  // top level blocks should have {type: 'ENTRY' }
  const _frag = frag.reduce((acc: Node[], curr: Node) => {
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

  // convert slate frag to databyss frag
  const _databyssFrag = _frag.map((block) => {
    const _block = {
      text: {
        textValue: Node.string(block),
        ranges: slateRangesToStateRanges(block),
      },
      type: BlockType.Entry,
      _id: uid(),
    }
    return _block
  })

  return _databyssFrag
}

export const htmlToDatabyssFrag = (html: string): Block[] => {
  const parsed = new DOMParser().parseFromString(html, 'text/html')

  const fragment: Node[] = deserialize(parsed.body)
  const _databysFragment = formatFragment(fragment)
  return _databysFragment
}
