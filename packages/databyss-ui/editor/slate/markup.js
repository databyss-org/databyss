import cloneDeep from 'clone-deep'
import { Editor, Value, Range, Point } from 'slate'
import { isAtomicInlineType } from './page/reducer'

export const getRangesFromBlock = block => {
  const { nodes } = block
  let text = ''
  // if not atomic block, returns text and ranges
  if (!isAtomicInlineType(block.type)) {
    return {
      ranges: nodes
        .map((n, i) => {
          // compile full text
          text += n.text
          let range = {}
          if (n.marks.length) {
            const _nodes = cloneDeep(nodes)

            // find length of all previous nodes
            _nodes.splice(i)
            const previousTextLength = _nodes.reduce(
              (total, current) => total + current.text.length,
              0
            )
            // create range object
            range = {
              offset: previousTextLength,
              length: n.text.length,
              marks: n.marks.map(m => m.type),
            }
          }

          return range
        })
        .filter(x => x.length != null),
      textValue: text,
    }
  }
  return null
}

export const slateToState = (slate, _id) => {
  const { ranges, textValue } = getRangesFromBlock(slate)
  const response = {
    _id,
    textValue,
    ranges,
  }
  return { [slate.key]: response }
}

export const stateToSlateMarkup = state => {
  const _value = Value.fromJSON({
    document: {
      nodes: [
        {
          object: 'block',
          type: 'ENTRY',
          nodes: [
            {
              object: 'text',
              text: '',
            },
          ],
        },
      ],
    },
  })

  const _editor = new Editor({ value: _value })
  // insert text in mock editor

  _editor.insertText(state.textValue).moveBackward(state.textValue.length)
  // select correct range and apply marks

  const reducer = (acc, curr) => {
    const anchor = new Point({ path: [0], offset: curr.offset })
    const focus = new Point({ path: [0], offset: curr.length + curr.offset })

    acc.setAnchor(anchor)
    acc.setFocus(focus)

    curr.marks.forEach(m => {
      acc.addMark(m)
    })
    return acc
  }
  if (state.ranges) {
    state.ranges.reduce(reducer, _editor)
  }

  // translate to json
  const document = _editor.value.toJSON().document
  return document
}

export const stateToSlate = (state, id) => {
  const _id = Object.keys(state)[0]
  const _state = cloneDeep(state)
  const _stateObject = _state[_id]
  const document = stateToSlateMarkup(_stateObject)
  return { ...document.nodes[0], key: id }
}

export const lineStateToSlate = state => {
  const _state = { textValue: state.textValue, ranges: state.ranges }
  const document = stateToSlateMarkup(_state)
  return { ...document.nodes[0], type: 'TEXT' }
}
