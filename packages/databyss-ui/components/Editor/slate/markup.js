import cloneDeep from 'clone-deep'
import { Mark, Block, Range, Point, Document, Editor, Value } from 'slate'

export const stateToSlate = (slate, _id) => {
  const { nodes } = slate
  let text = ''
  let ranges = nodes.map((n, i) => {
    // compile full text
    text += n.text
    let range = {}
    if (n.marks.length) {
      const _nodes = cloneDeep(nodes)
      // find length of all previous nodes
      _nodes.splice(i)
      const previousTextLength = _nodes.reduce((total, current, index) => {
        return total + current.text.length
      }, 0)
      range = {
        offset: previousTextLength,
        length: n.text.length,
        marks: n.marks.map(m => m.type),
      }
    }
    return range
  })
  // remove empty values
  ranges = ranges.filter(x => {
    return x.length != null
  })
  const response = {
    _id,
    text,
    ranges,
  }
  return { [_id]: response }
}

export const slateToState = state => {
  const _id = Object.keys(state)[0]
  const _state = cloneDeep(state)
  const _stateObject = _state[_id]

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
  _editor.insertText(_stateObject.text).moveBackward(_stateObject.text.length)

  _stateObject.ranges.forEach(n => {
    _editor.moveForward(n.offset).moveFocusForward(n.length)
    n.marks.forEach(m => {
      _editor.addMark(m)
    })
    _editor.moveFocusBackward(n.length).moveBackward(n.offset)
  })

  const document = _editor.value.toJSON().document
  return { ...document.nodes[0], key: _stateObject._id }

  // console.log(JSON.stringify(_editor.value.toJSON(), null, 2))
}
